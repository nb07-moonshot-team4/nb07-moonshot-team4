# nb07-moonshot-team4

# Git 협업 규칙 v1

**1️⃣ Branch Rule**

**구조**

- `main` — 완성된 안정 버전만
- `develop` — 기능 모으는 통합 브랜치
- `feature/*/*`

**🙆‍♂️ feature 브랜치 이름 규칙**

```
feature/name/기능명
```

ex. `feature/kwankyu/comment`

---

**2️⃣ PR Rule**

```
📌 관련 이슈 번호 ex) #이슈번호

<br>

📘 작업 유형
 - [] 신규 기능 추가
 - [] 버그 수정
 - [] 리팩토링

<br>

📙 작업 내역 (구현 내용 및 작업 내역을 기재합니다.)
 - 작업 내역 1
 - 작업 내역 2

<br>

📕 고민 내용 (자유롭게 생각했던 바를 작성합니다.)
 - 고민 내용 1
 - 고민 내용 2

<br>

📋 체크리스트 (PR을 올리기 전에 스스로 확인해봐요!)
 - PR 제목에 작업 내용을 요약하여 기재했는가?
 - 코딩컨벤션을 준수하는가?
 - 내 코드에 대해 스스로 검토를 했는가?

<br>

📝 특이 사항
PR을 볼 때 주의깊게 봐야할 점이 있으면 작성해 주세요!

```

**🤩 PR Review 남기는 방법**

오른쪽 초록색 Review changes button 누르기!

![스크린샷 2025-12-09 오후 1.24.29.png](attachment:ed425656-0e7d-48a6-8e40-a238a111d615:스크린샷_2025-12-09_오후_1.24.29.png)

![스크린샷 2025-12-09 오후 1.28.29.png](attachment:1582704b-27de-43c0-b8e2-c36de8bbf943:스크린샷_2025-12-09_오후_1.28.29.png)

**😎 PR Review (Reviewer)**

- 코드 확인하기
- 이상 있으면 `Comment`
- 궁금한 점 있으면 `Comment`
- 완료되었으면 `Comment` 남기고 Approve 로 리뷰 상태변경

**😎 PR Review (Author)**

- Template 사용
- 체크리스트 점검
- 공유 (깃헙웹훅으로 공유 알림 확인)
- Conflict(충돌) 시 헬프 요청
- `Comment` 확인 후 수정사항 수정 혹은 헬프 요청
- Approve가 2개 이상일 시 Git 관리자에게 Merge 요청

---

**3️⃣ Develop 기반 Git 최신화 Rule**

> **최신화 방법**
> 
1. Develop Branch 디스코드 웹훅 알림 확인
2. 팀원 각 feature 브랜치 최신화

```
// 1. Develop 브랜치 최신화

git fetch
git checkout develop

// 변경사항 확인
git diff ...origin

⭐️git pull origin develop⭐️
```

```
// 2. 자신의 브랜치 최신화 (Rebase)

git checkout feature/*/*
git rebase develop
```

---

**4️⃣ Conflict Rule**

- 충돌 발생 시 빠르게 헬프 요청

```markdown
git commit -m "fix: conflict resolved"
```

---

**5️⃣ Commit Rule**

**Title**

- **50자 제한, 마침표 제외**
ex. `feat: comment router 추가`
- **issue(optional) 일 경우 해시태그와 issueNumber 추가**
ex. `#1 feat: comment router 추가`

```markdown
// 커밋종류

- feat 		: 새로운 기능 추가
- fix 		: 버그 수정
- docs 		: 문서 수정
- style 	: 코드 formatting, 세미콜론(;) 누락, 코드 변경이 없는 경우
- refactor 	: 코드 리팩토링
- test 		: 테스트 코드, 리팽토링 테스트 코드 추가
- chore 	: 빌드 업무 수정, 패키지 매니저 수정
```

**Content (optional)**

- **72자 제한**
- **How 보다 What, Why 작성**

ex. 

```
- commentService.js massive 우려
- comment.route.js 로 책임 분리
```

---

**❌ `main`, `develop` Branch 는 Git 관리자: ooo 외 건드리지 말기**

**❌ `package.json`, `package.lock` 등 프로젝트 관리자: ooo 외 건드리지말기**

**❌ PR 없이 바로 Merge 금지 (깃헙 프로젝트에서 권한 설정 완료)**

**❌ Develop 최신화 (공유 시, 입실, 퇴실 시마다 확인) 꼭 하기** 

**❌ Commit Rule 지키기**

**❌ 팀원 브랜치  건들이지 않기**
