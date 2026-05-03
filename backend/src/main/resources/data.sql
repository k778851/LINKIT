-- ============================================================
-- LINKIT 샘플 데이터 (H2 개발용)
-- ============================================================

-- 유저 (비밀번호는 DataInitializer 에서 실제 BCrypt 해시로 교체됨)
-- 고유번호 포맷: YYYYMMDD-NNNNN
INSERT INTO users (id, nickname, handle, emoji, bio, password, role, created_at) VALUES
  ('admin',   '관리자',    '00000000-00000', '🛡️', 'LINKIT 관리자',            '$2a$10$dummyhash_admin', 'ADMIN', NOW()),
  ('user-1',  '러닝장',    '20240001-00001', '🏃', '매주 달리는 러닝 크루장',  '$2a$10$dummyhash1',     'USER',  NOW()),
  ('user-2',  '피자러버',  '20240001-00002', '🍕', '맛집 탐방 전문가',          '$2a$10$dummyhash2',     'USER',  NOW()),
  ('user-3',  '필름감성',  '20240001-00003', '📷', '필름 사진 모임장',          '$2a$10$dummyhash3',     'USER',  NOW()),
  ('user-4',  '밴드마스터','20240001-00004', '🎵', '홍대 밴드 클럽장',          '$2a$10$dummyhash4',     'USER',  NOW()),
  ('user-5',  '독서왕',    '20240001-00005', '📚', '한 달에 한 권 독서모임',    '$2a$10$dummyhash5',     'USER',  NOW()),
  ('user-6',  '풋살왕',    '20240001-00006', '⚽', '주말 풋살 크루장',          '$2a$10$dummyhash6',     'USER',  NOW()),
  ('user-me', '링킷유저',  '20240001-00099', '😊', '소모임을 사랑하는 사람 🙌', '$2a$10$dummyhash0',     'USER',  NOW());

-- 클럽
INSERT INTO clubs (id, name, emoji, category, description, member_count, new_count, is_private, schedule, location, created_by, created_at) VALUES
  ('club-1','러닝 크루',    '🏃','운동',  '매주 금요일 저녁 여의도에서 함께 달려요! 초보자도 환영합니다. 5km~10km 코스 운영 중.',156, 8,false,'매주 금요일 20:00','여의도',  'user-1','2026-03-01T00:00:00'),
  ('club-2','맛집 탐방대',  '🍕','음식',  '서울 곳곳의 숨은 맛집을 함께 탐방합니다. 매주 새로운 곳으로!',                        89,  3,false,'매주 토요일 12:00','서울 전역','user-2','2026-03-05T00:00:00'),
  ('club-3','감성 사진 모임','📸','아트',  '필름 감성 사진을 좋아하는 분들의 모임. 매달 출사 진행.',                                43,  2,false,'매월 둘째 주 일요일','성수동', 'user-3','2026-03-10T00:00:00'),
  ('club-4','밴드 클럽',    '🎵','음악',  '악기 연주를 즐기는 분들과 함께 합주하고 공연도 기획해요.',                              98,  6,true, '매주 수요일 19:00','홍대',   'user-4','2026-03-12T00:00:00'),
  ('club-5','책 읽는 모임', '📚','스터디','한 달에 한 권, 함께 읽고 이야기 나누는 독서 모임입니다.',                              67,  4,false,'매월 마지막 주 토요일','강남', 'user-5','2026-03-15T00:00:00'),
  ('club-6','풋살 크루',    '⚽','운동',  '실력 불문! 즐겁게 땀 흘리는 풋살 모임. 주말 정기전 진행.',                            312, 12,false,'매주 일요일 15:00','오치동',  'user-6','2026-03-20T00:00:00');

-- 클럽 태그
INSERT INTO club_tags (club_id, tag) VALUES
  ('club-1','운동'),('club-1','러닝'),('club-1','여의도'),
  ('club-2','음식'),('club-2','맛집'),('club-2','서울'),
  ('club-3','사진'),('club-3','필름'),('club-3','성수동'),
  ('club-4','음악'),('club-4','밴드'),('club-4','홍대'),
  ('club-5','독서'),('club-5','스터디'),('club-5','강남'),
  ('club-6','운동'),('club-6','풋살'),('club-6','오치동');

-- 클럽 멤버십 (user-me: club-1, club-6 가입 / club-3,4,5 찜)
INSERT INTO club_members (club_id, user_id) VALUES
  ('club-1','user-1'),('club-1','user-me'),
  ('club-6','user-6'),('club-6','user-me');

INSERT INTO club_bookmarks (club_id, user_id) VALUES
  ('club-3','user-me'),
  ('club-4','user-me'),
  ('club-5','user-me');

-- 일정
INSERT INTO schedules (id, club_id, time, start_at, location) VALUES
  ('sch-1','club-1','20:00','2026-05-02T11:00:00','여의도 한강공원'),
  ('sch-2','club-6','15:00','2026-05-04T06:00:00','오치동 풋살장'),
  ('sch-3','club-3','10:00','2026-05-11T01:00:00','성수동 카페거리');

-- 커뮤니티 게시글
INSERT INTO posts (id, category, title, content, location, author_id, like_count, comment_count, view_count, created_at) VALUES
  ('post-1','일상',    '같이 꽃 보러 가실분!!!',          '이번 주말 여의도 벚꽃 축제 같이 가실 분 계신가요? 토요일 오후 2시에 모여서 산책하면 좋을 것 같아요 :)',       '여의도', 'user-me', 3,  4, 42,  DATEADD('HOUR',-3,NOW())),
  ('post-2','모임',    '이번 주 풋살 같이 하실 분!',       '이번 일요일 오후 3시 오치동 풋살장에서 진행합니다. 자리 2~3명 남았어요!',                                     '오치동', 'user-6',  8,  6, 89,  DATEADD('HOUR',-5,NOW())),
  ('post-3','질문',    '교회 근처 맛집 추천해주세요',      '이번 주 수요일 청년부 모임 후에 다같이 저녁 먹으려고 하는데 근처 맛집 아시는 분 추천 부탁드려요!',            NULL,     'user-7',  5,  9, 67,  DATEADD('HOUR',-8,NOW())),
  ('post-4','일상',    '오늘 날씨 너무 좋다 ☀️',           '점심 먹고 공원 산책했는데 완전 최고였어요. 이런 날씨에 모임 하기 딱이죠?',                                     NULL,     'user-me', 12, 3, 55,  DATEADD('HOUR',-10,NOW())),
  ('post-5','나눔',    '베이킹 해봤는데 나눠드려요',       '쿠키랑 마들렌을 너무 많이 구웠어요 ㅎㅎ 내일 청년부 오시는 분들 오실 때 가져갈게요!',                          NULL,     'user-9',  21, 8, 134, DATEADD('DAY',-1,NOW())),
  ('post-6','생활정보','이번 주 청년부 일정 공유',          '수요일 저녁 7시 예배 후 친교 모임, 토요일 오전 봉사활동, 주일 청년부 예배 1부 9시 / 2부 11시입니다.',        NULL,     'user-10', 15, 2, 210, DATEADD('DAY',-2,NOW())),
  ('post-7','모임',    '감성 사진 같이 찍을 분?',          '다음 주 성수동 나들이 계획 중인데요, 필름 카메라 가져오실 분 같이 사진 찍어요!',                               '성수동', 'user-3',  7,  5, 78,  DATEADD('DAY',-3,NOW())),
  ('post-8','생활정보','용봉동 24시 약국 위치 공유해요 💊', '용봉동 GS25 편의점 옆 건물 1층에 24시간 운영하는 약국이 있어요. 늦은 밤에도 이용 가능합니다!',               '용봉동', 'user-me', 12, 2, 98,  DATEADD('DAY',-1,NOW()));

-- 댓글
INSERT INTO comments (id, post_id, content, author_id, like_count, created_at) VALUES
  ('c-1','post-1','저도 가고 싶어요!!',           'user-8',  1, DATEADD('HOUR',-2,NOW())),
  ('c-2','post-1','몇 명이나 모였나요?',           'user-9',  0, DATEADD('HOUR',-1,NOW())),
  ('c-3','post-1','저 갈게요 ☺️',                 'user-7',  2, DATEADD('MINUTE',-30,NOW())),
  ('c-4','post-1','토요일 오후 2시 맞죠?',         'user-10', 0, DATEADD('MINUTE',-10,NOW())),
  ('c-5','post-3','근처 돈까스 집 추천! 맛있어요.','user-8',  3, DATEADD('HOUR',-7,NOW()));

-- 클럽 게시글
INSERT INTO club_posts (id, club_id, category, title, content, author_id, like_count, comment_count, view_count, created_at) VALUES
  ('cp-1','club-1','공지','이번 주 금요일 러닝 코스 변경 안내',  '4/26(금) 여의도 벚꽃 인파로 인해 한강 반포 코스로 변경됩니다. 집결 장소: 반포한강공원 3번 게이트. 시간 동일 20:00!','user-1', 14,5, 88,  DATEADD('HOUR',-1,NOW())),
  ('cp-2','club-1','자유','오늘 러닝 후기 😤 완전 힘들었다',     '10km 뛰었는데 마지막 2km가 진짜 지옥이었어요 ㅋㅋ 그래도 완주! 다음엔 더 잘할 수 있을 것 같아요.','user-2', 9, 3, 54,  DATEADD('HOUR',-6,NOW())),
  ('cp-3','club-1','질문','러닝화 추천 부탁드려요!',              '이제 막 시작한 초보인데 신발을 뭘 신어야 할지 모르겠어요. 쿠셔닝 좋은 거 위주로 추천해주시면 감사하겠습니다 🙏','user-me',4, 7, 41,  DATEADD('DAY',-2,NOW())),
  ('cp-4','club-3','공지','5월 출사 일정 — 성수동 카페거리',      '05/11(일) 오전 10시 성수동 카페거리에서 진행합니다. 필름카메라·디지털 모두 환영! 점심도 같이 먹어요 🍽️','user-3', 18,6, 120, DATEADD('DAY',-3,NOW())),
  ('cp-5','club-3','자유','지난 출사 사진 몇 장 공유해요',        '지난달 망원 출사에서 찍은 사진들이에요. 역시 골든아워에 필름감이 최고네요 📸 다들 사진 올려주세요!','user-4', 31,12,203, DATEADD('DAY',-5,NOW()));
