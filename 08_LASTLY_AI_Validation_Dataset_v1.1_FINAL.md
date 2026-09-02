# LASTLY AI Validation Dataset
## AI Parser / Safety / Regression Ground Truth
**Validation Dataset v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 문서 | AI Validation Dataset |
| 기준 문서 | 01 PRD v1.1 / 02 BRS v1.1 / 03 UFS v1.1 / 04 UI·UX FS v1.1 / 05 AI Parser v1.1 / 06 DB v1.1 / 07 API v1.1 |
| Dataset | 100 Ground Truth Cases |
| Parser Schema | 1.0 |
| 고정 기준일 | 2026-08-31 |
| Timezone | Asia/Seoul |
| Locale | ko-KR |
| 문서 상태 | **Development Baseline — Final Sync** |

---

# 1. 목적

이 Dataset은 LASTLY AI Parser가 사용자의 자연어를 임의 해석하여 잘못된 완료기록을 생성하지 않는지 검증하기 위한 Ground Truth다.

특히 다음을 Release Safety 대상으로 둔다.

- False Completion
- PLANNED 오기록
- NOT_COMPLETED 오기록
- QUERY 오기록
- OUT_OF_SCOPE 오기록
- 불확실 날짜의 임의 정확화
- 미래 완료기록
- 다중 행동 누락/혼합
- 5개 초과 행동의 부분 저장
- Action Normalization
- Parser Clarification
- `UNKNOWN` Safe Fallback
- `IMPLICIT_TODAY`
- `TARGET` 책임 분리

이 파일은 실제 모델 실행 결과가 아니라 **Expected Ground Truth**다.

---

# 2. 고정 Context

모든 Case는 별도 표기가 없는 한 다음 Context를 사용한다.

```json
{
  "current_local_date": "2026-08-31",
  "timezone": "Asia/Seoul",
  "locale": "ko-KR"
}
```

상대 날짜 판정은 이 Context를 기준으로 한다.

---

# 3. Record Candidate 판정

Dataset의 `record_candidate`는 AI가 출력하는 필드가 아니라 Validation 편의를 위해 서버 규칙으로 계산한 기대값이다.

```text
intent == COMPLETED
AND scope == IN_SCOPE
AND normalized_action != null
AND date_precision == EXACT
AND resolved_date != null
AND resolved_date <= current_local_date
AND needs_clarification == false
```

최종 저장에는 여전히 사용자 Confirmation이 필요하다.

---

# 4. 중요 책임 경계

`TARGET`은 AI Parser Clarification Type이 아니다.

Parser Clarification:

```text
COMPLETION
ACTION
DATE
SCOPE
```

“필터 갈았어”처럼 여러 Management Item 후보가 생기는 Target Ambiguity는 Parser 이후 Item Matching Layer에서 처리한다.

---

# 5. Safety 불변식

다음 Segment는 `record_candidate=true`가 될 수 없다.

```text
PLANNED
NOT_COMPLETED
UNCERTAIN
QUERY
UNKNOWN
OUT_OF_SCOPE
scope UNCERTAIN
needs_clarification=true
future date
```

---

# 6. 5개 초과 행동

최대 의미 행동 수:

```text
5
```

6개 이상:

```text
result_type = TOO_MANY_ACTIONS
overflow_detected = true
segments = []
```

부분 결과를 저장 후보로 반환하지 않는다.

---

# 7. 평가 방식

Runtime Evaluation 시 모델 결과를 Ground Truth와 비교한다.

평가 축:

1. Schema Validity
2. Result Type
3. Intent
4. Scope
5. Action Normalization
6. Date Precision
7. Date Resolution
8. Clarification
9. Multi-action Split
10. Record Candidate Safety

---

# 8. Release Gate

최소 기준:

```text
Schema Validity = 100%
False Completion = 0
Forbidden Record Candidate = 0
Future Record Candidate = 0
TOO_MANY_ACTIONS Partial Candidate = 0

Intent Accuracy >= 98%
Scope Accuracy >= 97%
Deterministic Date Accuracy >= 98%
Normalization Accuracy >= 95%
```

Safety Gate는 평균 점수보다 우선한다.

False Completion 1건이라도 발생하면 Release Blocker다.

---

# 9. Runtime Test 규칙

- 같은 Prompt Version 사용
- 같은 Parser Schema 1.0 사용
- Temperature/Provider 설정 기록
- 각 Case 독립 실행
- Provider Error와 Parser Error 분리
- 실제 Output 원문 보존
- Expected/Actual Diff 생성
- Failed Safety Case 별도 목록화
- Prompt 변경 시 100건 전체 재실행

---

# 10. Ground Truth Cases

아래 100건은 사람이 검토할 수 있는 Markdown 표현이며, 자동 테스트용 원본은 동봉 JSONL을 사용한다.


## VAL-001 — 오늘 이불 빨았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 이불 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-002 — 오늘 칫솔 바꿨어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 칫솔 바꿨어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-003 — 오늘 에어컨 필터 청소했어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 에어컨 필터 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-004 — 어제 세탁조 청소했어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "어제 세탁조 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": "어제",
      "resolved_date": "2026-08-30",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-005 — 그저께 침구 빨았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "그저께 침구 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "침구 세탁",
      "date_expression": "그저께",
      "resolved_date": "2026-08-29",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-006 — 지난 토요일에 욕실 청소했어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난 토요일에 욕실 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": "지난 토요일",
      "resolved_date": "2026-08-29",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-007 — 지난주 월요일에 수건 삶았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난주 월요일에 수건 삶았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "수건 삶기",
      "date_expression": "지난주 월요일",
      "resolved_date": "2026-08-24",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-008 — 8월 15일에 커튼 빨았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "8월 15일에 커튼 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "커튼 세탁",
      "date_expression": "8월 15일",
      "resolved_date": "2026-08-15",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-009 — 7월 1일에 냉장고 청소했어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "7월 1일에 냉장고 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "냉장고 청소",
      "date_expression": "7월 1일",
      "resolved_date": "2026-07-01",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-010 — 2026년 6월 20일에 정수기 필터 갈았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "2026년 6월 20일에 정수기 필터 갈았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "정수기 필터 교체",
      "date_expression": "2026년 6월 20일",
      "resolved_date": "2026-06-20",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-011 — 칫솔 바꿨어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "칫솔 바꿨어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-012 — 이불 빨았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이불 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-013 — 가습기 청소했어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "가습기 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "가습기 청소",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-014 — 행주 삶았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "행주 삶았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "행주 삶기",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-015 — 베개커버 갈았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "베개커버 갈았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "베개커버 교체",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-016 — 오늘 렌즈통 바꿨어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 렌즈통 바꿨어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "렌즈통 교체",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-017 — 어제 로봇청소기 먼지통 청소했어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "어제 로봇청소기 먼지통 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "로봇청소기 먼지통 청소",
      "date_expression": "어제",
      "resolved_date": "2026-08-30",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-018 — 8월 30일에 화장실 매트 빨았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "8월 30일에 화장실 매트 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "화장실 매트 세탁",
      "date_expression": "8월 30일",
      "resolved_date": "2026-08-30",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-019 — 지난 금요일에 공기청정기 필터 청소했어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난 금요일에 공기청정기 필터 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "공기청정기 필터 청소",
      "date_expression": "지난 금요일",
      "resolved_date": "2026-08-28",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-020 — 지난달 31일에 침대패드 빨았어

**Note:** 명확한 완료 생활관리 기록.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난달 31일에 침대패드 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "침대패드 세탁",
      "date_expression": "지난달 31일",
      "resolved_date": "2026-07-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-021 — 오늘 이불 빨려고 해

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 이불 빨려고 해",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-022 — 내일 칫솔 바꿀 거야

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "내일 칫솔 바꿀 거야",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-023 — 이번 주말에 에어컨 필터 청소할래

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이번 주말에 에어컨 필터 청소할래",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-024 — 다음주에 세탁조 청소해야지

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "다음주에 세탁조 청소해야지",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-025 — 오늘 밤에 수건 삶을 예정이야

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 밤에 수건 삶을 예정이야",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "수건 삶기",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-026 — 정수기 필터 갈아야 해

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "정수기 필터 갈아야 해",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "정수기 필터 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-027 — 이번 달 안에 커튼 빨 거야

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이번 달 안에 커튼 빨 거야",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "커튼 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-028 — 내일 냉장고 청소하려고

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "내일 냉장고 청소하려고",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "냉장고 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-029 — 주말에 욕실 청소할 계획이야

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "주말에 욕실 청소할 계획이야",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-030 — 다음번엔 베개커버 갈아야겠다

**Note:** 계획/미래 행동. Activity 후보가 아니다.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "다음번엔 베개커버 갈아야겠다",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "베개커버 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-031 — 오늘 이불 못 빨았어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 이불 못 빨았어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-032 — 칫솔 아직 안 바꿨어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "칫솔 아직 안 바꿨어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-033 — 에어컨 필터 청소 못 했어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "에어컨 필터 청소 못 했어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-034 — 세탁조 청소 안 했어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "세탁조 청소 안 했어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-035 — 정수기 필터 아직 못 갈았어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "정수기 필터 아직 못 갈았어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "정수기 필터 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-036 — 욕실 청소하려다 못 했어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "욕실 청소하려다 못 했어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-037 — 커튼은 안 빨았어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "커튼은 안 빨았어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "커튼 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-038 — 베개커버 교체 못했어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "베개커버 교체 못했어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "베개커버 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-039 — 냉장고 청소 아직이야

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "냉장고 청소 아직이야",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "냉장고 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-040 — 수건 삶는 건 못 했어

**Note:** 명시적 미완료. False Completion 방지 핵심.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "수건 삶는 건 못 했어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "수건 삶기",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-041 — 지난주쯤 이불 빨았던 것 같아

**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난주쯤 이불 빨았던 것 같아",
      "intent": "UNCERTAIN",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "지난주쯤",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "COMPLETION",
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-042 — 며칠 전에 칫솔 바꾼 것 같아

**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "며칠 전에 칫솔 바꾼 것 같아",
      "intent": "UNCERTAIN",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": "며칠 전에",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "COMPLETION",
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-043 — 에어컨 필터 청소했던가?

**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "에어컨 필터 청소했던가?",
      "intent": "UNCERTAIN",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "COMPLETION",
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-044 — 아마 지난달에 세탁조 청소했어

**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "아마 지난달에 세탁조 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": "지난달",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-045 — 한 2주 전쯤 커튼 빨았어

**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "한 2주 전쯤 커튼 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "커튼 세탁",
      "date_expression": "한 2주 전쯤",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-046 — 언젠가 최근에 욕실 청소했어

**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "언젠가 최근에 욕실 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": "최근",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-047 — 지난주 중에 정수기 필터 갈았어

**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난주 중에 정수기 필터 갈았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "정수기 필터 교체",
      "date_expression": "지난주 중",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-048 — 8월 초쯤 침구 빨았어

**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "8월 초쯤 침구 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "침구 세탁",
      "date_expression": "8월 초쯤",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-049 — 이불 언제 빨았지?

**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "QUERY_ONLY",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이불 언제 빨았지?",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "LAST_PERFORMED",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-050 — 칫솔 마지막으로 언제 바꿨어?

**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "QUERY_ONLY",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "칫솔 마지막으로 언제 바꿨어?",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "LAST_PERFORMED",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-051 — 에어컨 필터 청소한 지 며칠 됐지?

**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "QUERY_ONLY",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "에어컨 필터 청소한 지 며칠 됐지?",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "ELAPSED_SINCE",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-052 — 세탁조 청소 기록 보여줘

**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "QUERY_ONLY",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "세탁조 청소 기록 보여줘",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "HISTORY",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-053 — 정수기 필터 다음 교체일 언제야?

**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "QUERY_ONLY",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "정수기 필터 다음 교체일 언제야?",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "정수기 필터 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "NEXT_DUE",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-054 — 욕실 청소 언제 했더라

**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "QUERY_ONLY",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "욕실 청소 언제 했더라",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "LAST_PERFORMED",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-055 — 침구 세탁 기록이 어떻게 돼?

**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "QUERY_ONLY",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "침구 세탁 기록이 어떻게 돼?",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "침구 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "HISTORY",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-056 — 커튼 세탁 다음 관리일 알려줘

**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "QUERY_ONLY",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "커튼 세탁 다음 관리일 알려줘",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "커튼 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "NEXT_DUE",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-057 — 오늘 영화 봤어

**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 영화 봤어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-058 — 친구 만났어

**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "친구 만났어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-059 — 카페 다녀왔어

**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "카페 다녀왔어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-060 — 드라마 3화 봤어

**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "드라마 3화 봤어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-061 — 점심에 파스타 먹었어

**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "점심에 파스타 먹었어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-062 — 회사 회의 끝냈어

**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "회사 회의 끝냈어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-063 — 오늘 책 20페이지 읽었어

**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 책 20페이지 읽었어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-064 — 게임 한 판 했어

**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "게임 한 판 했어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-065 — 필터 갈았어

**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "필터 갈았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "필터 교체",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-066 — 청소했어

**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-067 — 교체했어

**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "교체했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-068 — 관리했어

**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "관리했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-069 — 집에 있는 필터 손봤어

**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "집에 있는 필터 손봤어",
      "intent": "COMPLETED",
      "scope": "UNCERTAIN",
      "normalized_action": "필터 관리",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION",
        "SCOPE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-070 — 그거 갈았어

**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "그거 갈았어",
      "intent": "COMPLETED",
      "scope": "UNCERTAIN",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION",
        "SCOPE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-071 — 오늘 이불 빨고 칫솔도 바꿨어

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MULTIPLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 이불 빨고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s2",
      "source_text": "칫솔도 바꿨어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-072 — 어제 세탁조 청소하고 오늘 에어컨 필터 청소했어

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MULTIPLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "어제 세탁조 청소하고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": "어제",
      "resolved_date": "2026-08-30",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s2",
      "source_text": "오늘 에어컨 필터 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-073 — 이불은 빨았고 칫솔은 내일 바꿀 거야

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MIXED",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이불은 빨았고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s2",
      "source_text": "칫솔은 내일 바꿀 거야",
      "intent": "PLANNED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-074 — 세탁조는 청소했는데 에어컨 필터는 못 했어

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MIXED",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "세탁조는 청소했는데",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s2",
      "source_text": "에어컨 필터는 못 했어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-075 — 오늘 이불 빨았고 영화도 봤어

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MIXED",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 이불 빨았고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s2",
      "source_text": "영화도 봤어",
      "intent": "COMPLETED",
      "scope": "OUT_OF_SCOPE",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-076 — 칫솔 바꿨고 이불 언제 빨았지?

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MIXED",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "칫솔 바꿨고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s2",
      "source_text": "이불 언제 빨았지?",
      "intent": "QUERY",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": "LAST_PERFORMED",
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-077 — 어제 욕실 청소하고 수건 삶고 행주도 삶았어

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MULTIPLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "어제 욕실 청소하고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": "어제",
      "resolved_date": "2026-08-30",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s2",
      "source_text": "수건 삶고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "수건 삶기",
      "date_expression": "어제",
      "resolved_date": "2026-08-30",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s3",
      "source_text": "행주도 삶았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "행주 삶기",
      "date_expression": "어제",
      "resolved_date": "2026-08-30",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-078 — 커튼은 지난주쯤 빨았고 베개커버는 오늘 갈았어

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MIXED",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "커튼은 지난주쯤 빨았고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "커튼 세탁",
      "date_expression": "지난주쯤",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ],
      "record_candidate": false
    },
    {
      "segment_id": "s2",
      "source_text": "베개커버는 오늘 갈았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "베개커버 교체",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-079 — 정수기 필터는 안 갈았고 냉장고는 청소했어

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MIXED",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "정수기 필터는 안 갈았고",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "정수기 필터 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    },
    {
      "segment_id": "s2",
      "source_text": "냉장고는 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "냉장고 청소",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-080 — 이불 빨고 칫솔 바꾸고 욕실 청소하고 세탁조 청소하고 필터 청소했어

**Note:** 복수 의미 단위 분리 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "MULTIPLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이불 빨고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s2",
      "source_text": "칫솔 바꾸고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s3",
      "source_text": "욕실 청소하고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s4",
      "source_text": "세탁조 청소하고",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    },
    {
      "segment_id": "s5",
      "source_text": "필터 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "필터 청소",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-081 — 이불 빨고 칫솔 바꾸고 욕실 청소하고 세탁조 청소하고 필터 청소하고 커튼도 빨았어

**Note:** 5개 초과 의미 행동. 부분 결과를 반환하지 않는다.

```json
{
  "schema_version": "1.0",
  "result_type": "TOO_MANY_ACTIONS",
  "overflow_detected": true,
  "segments": []
}
```

## VAL-082 — 지난 토요일에 이불 빨았어

**Note:** 날짜 경계/무연도/근사 표현 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난 토요일에 이불 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "지난 토요일",
      "resolved_date": "2026-08-29",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-083 — 지난 일요일에 욕실 청소했어

**Note:** 날짜 경계/무연도/근사 표현 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난 일요일에 욕실 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": "지난 일요일",
      "resolved_date": "2026-08-30",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-084 — 8월 31일에 칫솔 바꿨어

**Note:** 날짜 경계/무연도/근사 표현 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "8월 31일에 칫솔 바꿨어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": "8월 31일",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-085 — 9월 1일에 칫솔 바꿨어

**Note:** 날짜 경계/무연도/근사 표현 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "9월 1일에 칫솔 바꿨어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": "9월 1일",
      "resolved_date": "2025-09-01",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-086 — 12월 31일에 필터 갈았어

**Note:** 날짜 경계/무연도/근사 표현 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "12월 31일에 필터 갈았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "필터 교체",
      "date_expression": "12월 31일",
      "resolved_date": "2025-12-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-087 — 이번 달 초에 이불 빨았어

**Note:** 날짜 경계/무연도/근사 표현 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이번 달 초에 이불 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "이번 달 초",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-088 — 지난달쯤 필터 청소했어

**Note:** 날짜 경계/무연도/근사 표현 검증.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "지난달쯤 필터 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "필터 청소",
      "date_expression": "지난달쯤",
      "resolved_date": null,
      "date_precision": "APPROXIMATE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE",
        "ACTION"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-089 — 이불 빨려고 했는데 안 빨았어

**Note:** 부정/반전 문장에서 False Completion을 방지.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이불 빨려고 했는데 안 빨았어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-090 — 칫솔 바꾼 줄 알았는데 안 바꿨어

**Note:** 부정/반전 문장에서 False Completion을 방지.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "칫솔 바꾼 줄 알았는데 안 바꿨어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-091 — 에어컨 필터 청소한 게 아니라 그냥 확인만 했어

**Note:** 부정/반전 문장에서 False Completion을 방지.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "에어컨 필터 청소한 게 아니라 그냥 확인만 했어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-092 — 세탁조 청소는 못 했지만 욕실은 청소했어

**Note:** 대조문에서 완료/미완료를 분리.

```json
{
  "schema_version": "1.0",
  "result_type": "MIXED",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "세탁조 청소는 못 했지만",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    },
    {
      "segment_id": "s2",
      "source_text": "욕실은 청소했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "욕실 청소",
      "date_expression": null,
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "IMPLICIT_TODAY",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-093 — 정수기 필터를 갈까 했지만 아직 안 갈았어

**Note:** 부정/반전 문장에서 False Completion을 방지.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "정수기 필터를 갈까 했지만 아직 안 갈았어",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "정수기 필터 교체",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-094 — 이불 빨았냐고? 아니 아직

**Note:** 부정/반전 문장에서 False Completion을 방지.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "이불 빨았냐고? 아니 아직",
      "intent": "NOT_COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "NOT_APPLICABLE",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": false
    }
  ]
}
```

## VAL-095 — 오늘 침대 이불을 세탁기에 돌렸어

**Note:** 표현 차이를 관리 Action으로 정규화.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 침대 이불을 세탁기에 돌렸어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-096 — 오늘 칫솔 새 걸로 갈았어

**Note:** 표현 차이를 관리 Action으로 정규화.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 칫솔 새 걸로 갈았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "칫솔 교체",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-097 — 오늘 에어컨 망 씻었어

**Note:** 표현 차이를 관리 Action으로 정규화.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 에어컨 망 씻었어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "에어컨 필터 청소",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-098 — 오늘 세탁기 통세척 했어

**Note:** 표현 차이를 관리 Action으로 정규화.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 세탁기 통세척 했어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "세탁조 청소",
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": false,
      "clarification_types": [],
      "record_candidate": true
    }
  ]
}
```

## VAL-099 — 음... 뭐였더라

**Note:** 생활관리 행동을 안정적으로 추출할 수 없음.

```json
{
  "schema_version": "1.0",
  "result_type": "NO_ACTION",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "음... 뭐였더라",
      "intent": "UNKNOWN",
      "scope": "UNCERTAIN",
      "normalized_action": null,
      "date_expression": null,
      "resolved_date": null,
      "date_precision": "UNKNOWN",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "ACTION",
        "SCOPE"
      ],
      "record_candidate": false
    }
  ]
}
```

## VAL-100 — 내일 이불 빨았어

**Note:** 완료형과 미래 날짜가 충돌. 미래 Activity를 만들지 않고 확인.

```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "내일 이불 빨았어",
      "intent": "UNKNOWN",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "내일",
      "resolved_date": null,
      "date_precision": "UNKNOWN",
      "date_resolution_source": "NONE",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "COMPLETION",
        "DATE"
      ],
      "record_candidate": false
    }
  ]
}
```

# 11. Dataset Summary

```text
Cases = 100
Semantic Segments = 114
Expected Record Candidates = 46
Safety-tagged Cases = 26
```

Result Type 분포:

```text
{
  "MIXED": 7,
  "MULTIPLE": 4,
  "NO_ACTION": 1,
  "QUERY_ONLY": 8,
  "SINGLE": 79,
  "TOO_MANY_ACTIONS": 1
}
```

Intent 분포:

```text
{
  "COMPLETED": 71,
  "NOT_COMPLETED": 18,
  "PLANNED": 11,
  "QUERY": 9,
  "UNCERTAIN": 3,
  "UNKNOWN": 2
}
```

Scope 분포:

```text
{
  "IN_SCOPE": 102,
  "OUT_OF_SCOPE": 9,
  "UNCERTAIN": 3
}
```

---

# 12. Regression 필수군

특히 다음 Case군은 매 Prompt 변경마다 반드시 확인한다.

- VAL-021~030: PLANNED
- VAL-031~040: NOT_COMPLETED
- VAL-041~048: UNCERTAIN / APPROXIMATE
- VAL-049~056: QUERY
- VAL-057~064: OUT_OF_SCOPE
- VAL-065~070: Ambiguity
- VAL-071~080: Multi/Mixed
- VAL-081: TOO_MANY_ACTIONS
- VAL-082~088: Date Edge
- VAL-089~094: Negation/Contrast
- VAL-100: Future Completion Conflict

---

# 13. 실제 Runtime 완료 조건

본 Dataset 파일 생성만으로 AI Parser가 검증된 것은 아니다.

다음이 모두 완료되어야 Runtime Validation PASS다.

```text
실제 AI Provider 연결
↓
100 Case 실행
↓
Schema Validation
↓
Semantic Diff
↓
Safety Gate
↓
Accuracy Gate
↓
Failure Review
```

---

# 14. Codex 구현 절대 규칙

Codex는 다음을 임의 변경하지 않는다.

1. Ground Truth를 모델 출력에 맞춰 자동 수정
2. False Completion Case를 평균 Accuracy로 상쇄
3. PLANNED/NOT_COMPLETED/QUERY를 Record Candidate로 허용
4. OUT_OF_SCOPE를 Record Candidate로 허용
5. 불확실 날짜를 AI가 임의 정확 날짜로 변경
6. 6개 이상 행동에서 일부 Segment만 통과
7. Numeric Confidence Threshold로 Safety Rule 대체
8. `TARGET`을 Parser Clarification Enum에 추가
9. `UNKNOWN` Safe Fallback 제거
10. `IMPLICIT_TODAY` 규칙 제거
11. 현재 날짜/Timezone을 Client 추측값으로 대체
12. Prompt 변경 후 Dataset 일부만 선택 실행하고 전체 PASS로 주장

---

# 15. Development Baseline 완료

본 문서를 LASTLY AI Parser의 개발 전 Ground Truth 기준선으로 사용한다.

핵심 원칙:

> **AI의 평균 정확도보다 잘못된 완료기록을 만들지 않는 것이 우선이다.**

---

## AI Validation Dataset v1.1 Final Sync 상태

**Ground Truth:** 100 Cases  
**Parser Schema:** 1.0  
**Fixed Date:** 2026-08-31  
**Timezone:** Asia/Seoul  
**False Completion Safety:** 반영  
**Future Date Safety:** 반영  
**PLANNED / NOT_COMPLETED / QUERY / UNKNOWN:** 반영  
**OUT_OF_SCOPE:** 반영  
**Approximate Date:** 반영  
**IMPLICIT_TODAY:** 반영  
**Multi/Mixed:** 반영  
**TOO_MANY_ACTIONS:** 반영  
**TARGET 책임 분리:** 반영  
**JSONL 자동 테스트 파일:** 포함  
**Runtime Provider Test:** 구현 후 실행 필요
