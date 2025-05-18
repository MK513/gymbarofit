# 25.05.18
1. Spring Security 통한 Jwt 구현
- CustomAuthenticationFilter 구현
- JwtTokenFilter 구현
- login로직 filter로 이동
- 테스트 클래스 3개 구현 (CustomAuthenticationProvider, CustomUserDetailService, JwtTokenProvider)
 
2. GenderStatus -> String class 변경
3. UserRepository jpa class로 변경
4. GlobalExceptionHandler 구현
- 내부 에러 발생시 react로 에러 내용 리턴
5. CORS 처리
- CorsConfig 구현
6. react Login, Signup 로직 구현

# 25.05.17
1. Jwt 적용 중
- CustomAuthenticationFilter 구현
- CustomAuthenticationProvider 구현
- CustomUserDetails 구현
- CustomUserDetailService 구현
2. RoleStatus -> String class 변경

# 25.05.16
1. Dependency 추가
- Spring Security
- JWT
2. 회원 가입 및 로그인 로직 구현
3. 로그인 시 비밀번호 Bcrypt encoder 적용
4. Jwt 적용 중
- JwtTokenProvider 구현
- SecurityConfig 구현
- Filters 구현 예정

# 25.05.14
1. Dependency 추가
    - validation
2. 기능 명세서 작성
3. ERD 수정
4. 회원가입, 로그인 기능 구현 중

# 25.04.15
1. Dependency 추가
    - H2 database (테스트용 DB 구축 위함)
2. appllication.yml 파일 작성
    - H2 DB 연결처리
3. domainEntity 수정
    - log class 계층화
    - 기타 변수명 및 불필요한 변수 제거
4. Domain class 작성 
    - user 외 15개 class 작성

# 25.04.07
1. 로그 파일 분리
2. domainEntity, domainModel 디자인
    - ERD 추후 수정 필요

# 25.04.06
1. Dependency 추가
    - Lombok, Thymeleaf
2. ERD 작성
3. User class 작성