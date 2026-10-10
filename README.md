# 왕홍 메이크업 쇼츠 편집 — 처음부터 그대로 재현하는 가이드

무쌍(쌍꺼풀 없는 눈)이 중국 왕홍 메이크업을 받는 과정을 담은 **13분 50초짜리 무음 촬영본**을, 사용자가 만든 자막 트랙과 레퍼런스 쇼츠들을 기준으로 **약 78초 세로 쇼츠**로 편집한 작업 전체입니다.
FFmpeg로 컷을 만들고, Remotion(React)으로 자막을 얹습니다. 마지막 단계는 **자막 편집기**(Remotion Studio)로, 자막마다 드롭다운으로 스타일·연출을 바꿔 끼울 수 있습니다.

> 새로 이 작업을 맡은 사람은 이 README → `docs/01_전체흐름.md` 순서로 읽으면 같은 결과를 처음부터 만들 수 있습니다.

## 결과물 미리보기
- `previews/wanghong_v1_720p.mp4` — 첫 편집본(v1)
- `previews/wanghong_v5_720p.mp4` — 폰트 피드백 5회 반영본(v5)
- `qa/` — 버전별 장면 모음·스틸(검수 이미지), `qa/스타일카탈로그.jpg` — 편집기 스타일 전체 비교
- 최신 상태(편집기 기본값: 삼등분 레이아웃·역할별 스타일·샤랄라)는 `qa/editor_*.jpg` 스틸 참고
- 원본·렌더 영상(100MB 초과)은 GitHub 용량 제한으로 저장소에 없음 → `work/`에 직접 넣고 다시 만들기

## 폴더 구조
```
README.md
docs/                     ← 편집 방법과 기준(이 순서대로 읽기)
  01_전체흐름.md           처음부터 끝까지 단계별 실행
  02_원본분석.md           원본에서 확인한 사실과 분석 방법
  03_컷편집.md             자막 기준 컷 구성·속도·검정 구간 처리·두 가지 베이스 영상
  04_자막기준.md           확정된 자막 스타일 기준(폰트·크기·테두리·글로우·위치·연출)
  05_자막편집기.md          Remotion Studio 편집기 사용·확장법(새 스타일 예시 추가)
  06_레퍼런스분석.md        참고 쇼츠·예시 이미지별 분석과 재현 수치
  07_피드백이력.md          v1→v5→편집기까지 사용자 피드백과 반영 내용(왜 지금 기준이 됐는지)
  08_문제해결.md            실제로 겪은 오류와 해결(디스크 가득·zsh 인자·폰트 등)
pipeline/                 ← 원본 → 베이스 영상(FFmpeg, Python)
  analyze_source.sh        원본 분석(무음·검정 구간·화면 영역·장면 전환·장면 모음)
  extract_caption_track.py 사용자 자막 트랙 영상 → 자막 변경 시각 + 판독 이미지
  captions_src.json        자막 문구(원본 시각 기준) — 컷의 기준 데이터
  plan.py                  자막 → 컷 목록(cuts.json) + 출력 시각 자막
  cuts.json                최종 컷 목록(엔딩 2.9초 연장 반영)
  build_base.py            전체화면용 베이스 1080x1920
  build_base_square.py     삼등분용 베이스 1080x1096(잘림 없음)
editor/                   ← Remotion 프로젝트
  src/1010wh-editor/       자막 편집기(styles.ts 프리셋, Editor.tsx 렌더, Root.tsx 현재 값)
  src/history/1010wh~5     v1~v5 당시 자막 컴포지션(기록용)
  render-1010-wanghong-editor.cjs  편집기 값 그대로 렌더(vN 버전 폴더로 저장)
  public/1010wh/           폰트(어그로체 제외 — docs/04 참고)
data/                     ← 버전별 자막 데이터(captions_out.json, .srt), 분석 결과
project/                  ← 작업 기록(기획·변경이력·현재상태·버전목록·편집기 사용법)
references/               ← 레퍼런스 캡처·사용자 자막 트랙 영상·폰트 예시 이미지
qa/                       ← 검수 스틸·장면 모음
previews/                 ← 720p 미리보기 영상
work/ (git 제외)          ← 원본·베이스·렌더 결과가 생기는 작업 폴더
```

## 빠른 시작
```bash
# 0) 준비: ffmpeg, python3(numpy, pillow), node 20+
cd editor && npm install && cd ..
# 1) 원본 넣기
mkdir -p work/원본 && cp /경로/왕홍메이크업_1차.mp4 work/원본/
# 2) 베이스 영상 두 종 만들기(컷·속도는 pipeline/cuts.json)
python3 pipeline/build_base.py editor/public/1010wh/base.mp4
python3 pipeline/build_base_square.py editor/public/1010wh/base_square.mp4
# 3) 어그로체(SB 어그로 B) 폰트를 직접 받아 editor/public/1010wh/SBAggroB.ttf 로 저장(라이선스상 미포함, 편집기 기본값엔 안 쓰임)
# 4) 자막 편집기 열기 → http://localhost:3010
cd editor && npm run editor
# 5) 렌더(덮어쓰기 안 함): work/최종/v6/왕홍메이크업_v6.mp4
node render-1010-wanghong-editor.cjs v6
```

## 핵심 기준 한눈에(자세히는 docs/04)
| 역할 | 기본 스타일 | 예시 출처 |
|---|---|---|
| 기본 말자막 | Pretendard Medium 54px 흰색, 테두리 없이 은은한 그림자, 애니메이션 없이 말 단위로 툭툭 교체 | 기본자막.png(크기 2/3) · HxM6DROCO40 |
| 손글씨 혼잣말 | Yeon Sung 88px 흰색 + 그림자 | HxM6 "피부 : 살려줘" |
| 리액션·괄호 | Gaegu Bold 118px 흰색 + 검정 9px 테두리, 툭 튀어나옴 | HxM6 "(칭찬 중)" |
| 임팩트 | 제주명조 흰색 + 검정 테두리(가로 86%) | 뷰티폰트1 |
| 펀치 | 흰 제주명조 + **빨간 글로우**(글자색은 빨강 아님) | 빨간.png |
| 샤랄라 | 얇은 명조 흰색 + 분홍 글로우 + 분홍·흰 별과 하트 반짝(별무리식 흰 반짝이는 `starfield`로 선택 가능) | 샤랄라.png |
| 단계 라벨 | 노랑 Pretendard Medium, 얇은 3px 테두리 | 폰트2(얇게) |
| 레이아웃 | 삼등분: 위 검정 띠 제목 / 가운데 영상 / 아래 검정 띠 | 폰트2 |
| 자막 위치 | 화면 중앙에서 살짝 아래(약 64%) | HxM6DROCO40 |
| 색 사용 | 빨강 최소화 — 강조 단어는 흰 글자 + 빨간 글로우 | 사용자 피드백 |

## 라이선스·출처
- 코드·문서: 자유롭게 참고·재사용 가능.
- 폰트: Pretendard, 제주명조, Gowun Batang/Dodum, Gaegu, Yeon Sung, Dokdo, PoorStory, Do Hyeon, Playfair Display — 모두 SIL Open Font License. 어그로체(SB 어그로)는 재배포 조건이 불확실해 제외.
- `references/`의 캡처 이미지는 다른 크리에이터 쇼츠 화면으로, 자막 스타일 분석용 참고 자료입니다. 원 저작권은 각 크리에이터에게 있습니다.
