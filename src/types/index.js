/**
 * @typedef {'운동'|'음식'|'아트'|'스터디'|'음악'|'기타'} ClubCategory
 * @typedef {'일상'|'질문'|'모임'|'나눔'|'정보'|'생활정보'} PostCategory
 * @typedef {'light'|'dark'} Theme
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} nickname
 * @property {string} handle
 * @property {string} emoji
 * @property {string} bio
 * @property {string[]} joinedClubs
 * @property {string[]} bookmarkedClubs
 * @property {{ theme: Theme, language: string, notifications: { push: boolean, email: boolean, marketing: boolean } }} settings
 * @property {string} createdAt
 *
 * @typedef {Object} Club
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {ClubCategory} category
 * @property {string} description
 * @property {number} memberCount
 * @property {boolean} isPrivate
 * @property {string[]} posterImages
 * @property {string} schedule
 * @property {string} location
 * @property {string} createdBy
 * @property {string} createdAt
 *
 * @typedef {Object} Post
 * @property {string} id
 * @property {PostCategory} category
 * @property {string} title
 * @property {string} content
 * @property {string} [location]
 * @property {string} authorId
 * @property {string} authorNickname
 * @property {string} authorEmoji
 * @property {number} likeCount
 * @property {number} commentCount
 * @property {number} viewCount
 * @property {string} createdAt
 *
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} postId
 * @property {string} content
 * @property {string} authorId
 * @property {string} authorNickname
 * @property {string} authorEmoji
 * @property {number} likeCount
 * @property {string} createdAt
 */

export {};
