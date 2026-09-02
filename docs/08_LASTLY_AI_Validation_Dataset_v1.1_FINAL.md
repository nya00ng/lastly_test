# LASTLY AI Validation Dataset
## AI Parser / Safety / Regression Ground Truth
**Validation Dataset v1.1 — Final Sync Baseline**

| 항목 | 내용 |
|---|---|
| 서비스명 | LASTLY |
| 프로젝트 | 언제했조 |
| 기준 문서 | 01~07 v1.1 FINAL |
| Dataset | 100 Ground Truth Cases |
| Parser Schema | 1.0 |
| 고정 기준일 | 2026-08-31 |
| Timezone | Asia/Seoul |
| Locale | ko-KR |
| 상태 | **STATIC GROUND TRUTH / Runtime Provider 미실행** |

# 1. 목적
실제 AI Parser가 잘못된 완료기록을 만들지 않는지 검증하기 위한 Ground Truth다. 문서 정합성 PASS와 실제 Provider Accuracy PASS를 구분한다.

# 2. Parser Output 경계
각 Case의 `Expected Parser Output`에는 **05 Parser JSON Schema 1.0 필드만** 존재한다. `record_candidate`, `item_id`, Item Matching 결과는 Parser Output에 포함하지 않는다.

# 3. Server Record Candidate
Parser 이후 Server가 다음 조건으로 계산한다.

```text
intent == COMPLETED
AND scope == IN_SCOPE
AND normalized_action != null
AND date_precision == EXACT
AND resolved_date != null
AND resolved_date <= current_local_date
AND needs_clarification == false
```

# 4. TARGET 책임 분리
Parser Clarification은 `COMPLETION / ACTION / DATE / SCOPE`만 사용한다. TARGET 문제는 Parser 이후 Item Matching/UI 책임이다.

# 5. 5개 초과 행동
6개 이상이면 `TOO_MANY_ACTIONS`, `overflow_detected=true`, `segments=[]`. 부분 결과를 반환하거나 저장하지 않는다.

# 6. Release Safety Gate
- Schema Validity = 100%
- False Completion = 0
- Forbidden Record Candidate = 0
- Future Record Candidate = 0
- TOO_MANY_ACTIONS Partial Candidate = 0
- Intent Accuracy >= 98%
- Scope Accuracy >= 97%
- Deterministic Date Accuracy >= 98%
- Normalization Accuracy >= 95%

# 7. Runtime 규칙
Prompt/Model/Provider 변경 시 100건 전체를 같은 Context에서 재실행한다. Ground Truth를 모델 결과에 맞춰 임의 수정하지 않는다.

# 8. Ground Truth Cases

## VAL-001 — 오늘 이불 빨았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-002 — 오늘 칫솔 바꿨어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-003 — 오늘 에어컨 필터 청소했어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-004 — 어제 세탁조 청소했어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-005 — 그저께 침구 빨았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-006 — 지난 토요일에 욕실 청소했어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-007 — 지난주 월요일에 수건 삶았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-008 — 8월 15일에 커튼 빨았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-009 — 7월 1일에 냉장고 청소했어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-010 — 2026년 6월 20일에 정수기 필터 갈았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-011 — 칫솔 바꿨어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-012 — 이불 빨았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-013 — 가습기 청소했어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-014 — 행주 삶았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-015 — 베개커버 갈았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-016 — 오늘 렌즈통 바꿨어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-017 — 어제 로봇청소기 먼지통 청소했어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-018 — 8월 30일에 화장실 매트 빨았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-019 — 지난 금요일에 공기청정기 필터 청소했어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-020 — 지난달 31일에 침대패드 빨았어
**Note:** 명확한 완료 생활관리 기록.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-021 — 오늘 이불 빨려고 해
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-022 — 내일 칫솔 바꿀 거야
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-023 — 이번 주말에 에어컨 필터 청소할래
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-024 — 다음주에 세탁조 청소해야지
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-025 — 오늘 밤에 수건 삶을 예정이야
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-026 — 정수기 필터 갈아야 해
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-027 — 이번 달 안에 커튼 빨 거야
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-028 — 내일 냉장고 청소하려고
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-029 — 주말에 욕실 청소할 계획이야
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-030 — 다음번엔 베개커버 갈아야겠다
**Note:** 계획/미래 행동. Activity 후보가 아니다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-031 — 오늘 이불 못 빨았어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-032 — 칫솔 아직 안 바꿨어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-033 — 에어컨 필터 청소 못 했어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-034 — 세탁조 청소 안 했어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-035 — 정수기 필터 아직 못 갈았어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-036 — 욕실 청소하려다 못 했어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-037 — 커튼은 안 빨았어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-038 — 베개커버 교체 못했어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-039 — 냉장고 청소 아직이야
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-040 — 수건 삶는 건 못 했어
**Note:** 명시적 미완료. False Completion 방지 핵심.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-041 — 지난주쯤 이불 빨았던 것 같아
**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "COMPLETION",
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-042 — 며칠 전에 칫솔 바꾼 것 같아
**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "COMPLETION",
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-043 — 에어컨 필터 청소했던가?
**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

**Expected Parser Output:**
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
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-044 — 아마 지난달에 세탁조 청소했어
**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-045 — 한 2주 전쯤 커튼 빨았어
**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-046 — 언젠가 최근에 욕실 청소했어
**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-047 — 지난주 중에 정수기 필터 갈았어
**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-048 — 8월 초쯤 침구 빨았어
**Note:** 정확한 Activity 날짜를 AI가 발명하지 않고 사용자 확인을 요구.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-049 — 이불 언제 빨았지?
**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-050 — 칫솔 마지막으로 언제 바꿨어?
**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-051 — 에어컨 필터 청소한 지 며칠 됐지?
**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-052 — 세탁조 청소 기록 보여줘
**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-053 — 정수기 필터 다음 교체일 언제야?
**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-054 — 욕실 청소 언제 했더라
**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-055 — 침구 세탁 기록이 어떻게 돼?
**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-056 — 커튼 세탁 다음 관리일 알려줘
**Note:** 기억 조회 의도. Activity를 생성하지 않는다.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-057 — 오늘 영화 봤어
**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-058 — 친구 만났어
**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-059 — 카페 다녀왔어
**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-060 — 드라마 3화 봤어
**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-061 — 점심에 파스타 먹었어
**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-062 — 회사 회의 끝냈어
**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-063 — 오늘 책 20페이지 읽었어
**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-064 — 게임 한 판 했어
**Note:** 완료 사실일 수 있으나 LASTLY 반복 생활관리 범위 밖.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-065 — 필터 갈았어
**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

**Expected Parser Output:**
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
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-066 — 청소했어
**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

**Expected Parser Output:**
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
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-067 — 교체했어
**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

**Expected Parser Output:**
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
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-068 — 관리했어
**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

**Expected Parser Output:**
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
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-069 — 집에 있는 필터 손봤어
**Note:** 행동/범위가 불충분해 사용자 확인 필요. Item TARGET 선택과는 별개.

**Expected Parser Output:**
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
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-070 — 오늘 뭔가 관리한 것 같은데 정확히 모르겠어
**Note:** 생활관리 맥락은 있으나 완료·Action·Scope를 안전하게 확정할 수 없는 UNKNOWN fallback.

**Expected Parser Output:**
```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "오늘 뭔가 관리한 것 같은데 정확히 모르겠어",
      "intent": "UNKNOWN",
      "scope": "UNCERTAIN",
      "normalized_action": null,
      "date_expression": "오늘",
      "resolved_date": "2026-08-31",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "COMPLETION",
        "ACTION",
        "SCOPE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-071 — 오늘 이불 빨고 칫솔도 바꿨어
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True, True]`

## VAL-072 — 어제 세탁조 청소하고 오늘 에어컨 필터 청소했어
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True, True]`

## VAL-073 — 이불은 빨았고 칫솔은 내일 바꿀 거야
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True, False]`

## VAL-074 — 세탁조는 청소했는데 에어컨 필터는 못 했어
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True, False]`

## VAL-075 — 오늘 이불 빨았고 영화도 봤어
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True, False]`

## VAL-076 — 칫솔 바꿨고 이불 언제 빨았지?
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True, False]`

## VAL-077 — 어제 욕실 청소하고 수건 삶고 행주도 삶았어
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True, True, True]`

## VAL-078 — 커튼은 지난주쯤 빨았고 베개커버는 오늘 갈았어
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ]
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False, True]`

## VAL-079 — 정수기 필터는 안 갈았고 냉장고는 청소했어
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False, True]`

## VAL-080 — 이불 빨고 칫솔 바꾸고 욕실 청소하고 세탁조 청소하고 필터 청소했어
**Note:** 복수 의미 단위 분리 검증.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
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
      "clarification_types": []
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
      "clarification_types": []
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
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[True, True, True, True, False]`

## VAL-081 — 이불 빨고 칫솔 바꾸고 욕실 청소하고 세탁조 청소하고 필터 청소하고 커튼도 빨았어
**Note:** 5개 초과 의미 행동. 부분 결과를 반환하지 않는다.

**Expected Parser Output:**
```json
{
  "schema_version": "1.0",
  "result_type": "TOO_MANY_ACTIONS",
  "overflow_detected": true,
  "segments": []
}
```
**Expected Server Record Candidate:** `[]`

## VAL-082 — 지난 토요일에 이불 빨았어
**Note:** 날짜 경계/무연도/근사 표현 검증.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-083 — 지난 일요일에 욕실 청소했어
**Note:** 날짜 경계/무연도/근사 표현 검증.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-084 — 8월 31일에 칫솔 바꿨어
**Note:** 날짜 경계/무연도/근사 표현 검증.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-085 — 9월 1일에 칫솔 바꿨어
**Note:** 날짜 경계/무연도/근사 표현 검증.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-086 — 12월 31일에 필터 갈았어
**Note:** 날짜 경계/무연도/근사 표현 검증.

**Expected Parser Output:**
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
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-087 — 이번 달 초에 이불 빨았어
**Note:** 날짜 경계/무연도/근사 표현 검증.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-088 — 지난달쯤 필터 청소했어
**Note:** 날짜 경계/무연도/근사 표현 검증.

**Expected Parser Output:**
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
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE",
        "ACTION"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-089 — 이불 빨려고 했는데 안 빨았어
**Note:** 부정/반전 문장에서 False Completion을 방지.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-090 — 칫솔 바꾼 줄 알았는데 안 바꿨어
**Note:** 부정/반전 문장에서 False Completion을 방지.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-091 — 에어컨 필터 청소한 게 아니라 그냥 확인만 했어
**Note:** 부정/반전 문장에서 False Completion을 방지.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-092 — 세탁조 청소는 못 했지만 욕실은 청소했어
**Note:** 대조문에서 완료/미완료를 분리.

**Expected Parser Output:**
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
      "clarification_types": []
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False, True]`

## VAL-093 — 정수기 필터를 갈까 했지만 아직 안 갈았어
**Note:** 부정/반전 문장에서 False Completion을 방지.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-094 — 이불 빨았냐고? 아니 아직
**Note:** 부정/반전 문장에서 False Completion을 방지.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

## VAL-095 — 오늘 침대 이불을 세탁기에 돌렸어
**Note:** 표현 차이를 관리 Action으로 정규화.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-096 — 오늘 칫솔 새 걸로 갈았어
**Note:** 표현 차이를 관리 Action으로 정규화.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-097 — 오늘 에어컨 망 씻었어
**Note:** 표현 차이를 관리 Action으로 정규화.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-098 — 오늘 세탁기 통세척 했어
**Note:** 표현 차이를 관리 Action으로 정규화.

**Expected Parser Output:**
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
      "clarification_types": []
    }
  ]
}
```
**Expected Server Record Candidate:** `[True]`

## VAL-099 — 음... 뭐였더라
**Note:** 생활관리 행동으로 구조화할 의미 Segment가 없음.

**Expected Parser Output:**
```json
{
  "schema_version": "1.0",
  "result_type": "NO_ACTION",
  "overflow_detected": false,
  "segments": []
}
```
**Expected Server Record Candidate:** `[]`

## VAL-100 — 내일 이불 빨았어
**Note:** 완료형과 미래 날짜 충돌. Parser는 사실을 숨기지 않고 DATE clarification을 요구하며 서버 후보는 false.

**Expected Parser Output:**
```json
{
  "schema_version": "1.0",
  "result_type": "SINGLE",
  "overflow_detected": false,
  "segments": [
    {
      "segment_id": "s1",
      "source_text": "내일 이불 빨았어",
      "intent": "COMPLETED",
      "scope": "IN_SCOPE",
      "normalized_action": "이불 세탁",
      "date_expression": "내일",
      "resolved_date": "2026-09-01",
      "date_precision": "EXACT",
      "date_resolution_source": "EXPLICIT",
      "query_type": null,
      "needs_clarification": true,
      "clarification_types": [
        "DATE"
      ]
    }
  ]
}
```
**Expected Server Record Candidate:** `[False]`

# 9. Dataset Summary

```text
Cases = 100
Expected Server Record Candidates = 46
Parser Output contains record_candidate = 0
Parser Output contains item_id = 0
TARGET clarification = 0
```

# 10. Static Validation 상태
- VAL-001~VAL-100 연속/중복 0
- Schema field set 정합성 PASS
- NO_ACTION → segments=[] PASS
- TOO_MANY_ACTIONS → segments=[] PASS
- EXPLICIT date expression 정합성 PASS
- IMPLICIT_TODAY 정합성 PASS
- UNKNOWN Safe Fallback 포함
- Future Completion Conflict 포함
- Parser ↔ Server Candidate 책임 분리 PASS
- Parser ↔ Item Matching 책임 분리 PASS

**Runtime AI Accuracy:** 아직 미실행
