"use client";

import { useEffect, useRef, useState } from "react";

export type VoiceState =
  | "IDLE"
  | "REQUESTING_PERMISSION"
  | "LISTENING"
  | "TRANSCRIPT_READY"
  | "PERMISSION_DENIED"
  | "UNSUPPORTED"
  | "ERROR";

function getRecognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function getErrorCopy(error: SpeechRecognitionErrorCode | "unknown") {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "마이크 사용이 허용되지 않았어요. 브라우저에서 마이크 권한을 허용해주세요.";
  }
  if (error === "audio-capture") {
    return "마이크를 찾지 못했어요. 기기 연결을 확인하거나 직접 입력해주세요.";
  }
  if (error === "no-speech" || error === "aborted") {
    return "음성을 잘 듣지 못했어요. 다시 말하거나 직접 입력해주세요.";
  }
  if (error === "network") {
    return "음성 인식 연결이 불안정해요. 다시 말하거나 직접 입력해주세요.";
  }
  return "음성 입력을 이어가기 어려워요. 다시 말하거나 직접 입력해주세요.";
}

export function useVoiceRecognition(onFinalTranscript: (transcript: string) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeRef = useRef(false);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const stateRef = useRef<VoiceState>("IDLE");
  const transcriptRef = useRef("");
  const callbackRef = useRef(onFinalTranscript);
  const [state, setState] = useState<VoiceState>("IDLE");
  const [transcript, setTranscriptState] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    callbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  function updateState(nextState: VoiceState) {
    stateRef.current = nextState;
    setState(nextState);
  }

  function setTranscript(nextTranscript: string) {
    transcriptRef.current = nextTranscript;
    setTranscriptState(nextTranscript);
  }

  function stop() {
    if (!activeRef.current) return;
    activeRef.current = false;
    recognitionRef.current?.stop();
  }

  async function start() {
    const Recognition = getRecognitionConstructor();
    setMessage("");
    setInterimTranscript("");

    if (!Recognition) {
      updateState("UNSUPPORTED");
      setMessage("이 브라우저에서는 음성 입력을 사용할 수 없어요.");
      return;
    }
    if (activeRef.current || startingRef.current) return;

    startingRef.current = true;
    updateState("REQUESTING_PERMISSION");
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        startingRef.current = false;
        if (!mountedRef.current) return;
        const errorName = error instanceof DOMException ? error.name : "";
        const permissionDenied = errorName === "NotAllowedError" || errorName === "SecurityError";
        updateState(permissionDenied ? "PERMISSION_DENIED" : "ERROR");
        setMessage(getErrorCopy(permissionDenied ? "not-allowed" : "audio-capture"));
        return;
      }
    }

    if (!mountedRef.current) {
      startingRef.current = false;
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      startingRef.current = false;
      activeRef.current = true;
      updateState("LISTENING");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const value = result[0]?.transcript.trim();
        if (!value) continue;
        if (result.isFinal) finalText = `${finalText} ${value}`.trim();
        else interimText = `${interimText} ${value}`.trim();
      }

      if (finalText) {
        const nextTranscript = `${transcriptRef.current} ${finalText}`.trim();
        setTranscript(nextTranscript);
        updateState("TRANSCRIPT_READY");
        setMessage("이렇게 들은 내용을 확인하고 고칠 수 있어요.");
        callbackRef.current(nextTranscript);
        activeRef.current = false;
        recognition.stop();
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      startingRef.current = false;
      activeRef.current = false;
      updateState(event.error === "not-allowed" || event.error === "service-not-allowed" ? "PERMISSION_DENIED" : "ERROR");
      setMessage(getErrorCopy(event.error));
    };

    recognition.onend = () => {
      startingRef.current = false;
      activeRef.current = false;
      recognitionRef.current = null;
      if (stateRef.current === "LISTENING") {
        if (transcriptRef.current.trim()) updateState("TRANSCRIPT_READY");
        else {
          updateState("ERROR");
          setMessage(getErrorCopy("no-speech"));
        }
      }
    };

    setTranscript("");
    try {
      recognition.start();
    } catch {
      startingRef.current = false;
      activeRef.current = false;
      updateState("ERROR");
      setMessage(getErrorCopy("unknown"));
    }
  }

  function retry() {
    stop();
    setTranscript("");
    setInterimTranscript("");
    start();
  }

  function reset() {
    stop();
    setTranscript("");
    setInterimTranscript("");
    setMessage("");
    updateState("IDLE");
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      activeRef.current = false;
      startingRef.current = false;
    };
  }, []);

  return { interimTranscript, message, reset, retry, setTranscript, start, state, stop, transcript };
}
