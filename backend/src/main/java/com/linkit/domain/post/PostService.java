package com.linkit.domain.post;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository likeRepository;

    public List<PostDto.Response> getPosts(String category, String userId) {
        List<Post> posts = switch (category != null ? category : "전체") {
            case "인기"  -> postRepository.findAllByOrderByLikeCountDesc();
            case "전체"  -> postRepository.findAllByOrderByCreatedAtDesc();
            default      -> postRepository.findByCategoryOrderByCreatedAtDesc(category);
        };
        return posts.stream()
                .map(p -> PostDto.Response.from(p, isLiked(p.getId(), userId)))
                .toList();
    }

    public PostDto.Response getPost(String postId, String userId) {
        return PostDto.Response.from(findById(postId), isLiked(postId, userId));
    }

    @Transactional
    public PostDto.Response createPost(PostDto.CreateRequest req, String userId) {
        Post post = Post.builder()
                .id("post-" + UUID.randomUUID().toString().substring(0, 8))
                .category(req.getCategory())
                .title(req.getTitle())
                .content(req.getContent())
                .location(req.getLocation())
                .authorId(userId)
                .build();
        return PostDto.Response.from(postRepository.save(post), false);
    }

    @Transactional
    public PostDto.Response updatePost(String postId, PostDto.UpdateRequest req, String userId) {
        Post post = findById(postId);
        if (!post.getAuthorId().equals(userId)) throw new AccessDeniedException("게시글 수정 권한이 없습니다.");
        if (req.getCategory() != null) post.setCategory(req.getCategory());
        if (req.getTitle()    != null) post.setTitle(req.getTitle());
        if (req.getContent()  != null) post.setContent(req.getContent());
        if (req.getLocation() != null) post.setLocation(req.getLocation());
        return PostDto.Response.from(post, isLiked(postId, userId));
    }

    @Transactional
    public void deletePost(String postId, String userId) {
        Post post = findById(postId);
        if (!post.getAuthorId().equals(userId)) throw new AccessDeniedException("게시글 삭제 권한이 없습니다.");
        postRepository.delete(post);
    }

    @Transactional
    public void incrementView(String postId) {
        Post post = findById(postId);
        post.setViewCount(post.getViewCount() + 1);
    }

    @Transactional
    public boolean toggleLike(String postId, String userId) {
        Post post = findById(postId);
        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            likeRepository.deleteByPostIdAndUserId(postId, userId);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            return false;
        } else {
            likeRepository.save(new PostLike(postId, userId));
            post.setLikeCount(post.getLikeCount() + 1);
            return true;
        }
    }

    public List<PostDto.Response> getMyPosts(String userId) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(p -> PostDto.Response.from(p, isLiked(p.getId(), userId)))
                .toList();
    }

    /* ── 내부 헬퍼 ───────────────────────────────────── */

    private Post findById(String id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));
    }

    private boolean isLiked(String postId, String userId) {
        return userId != null && likeRepository.existsByPostIdAndUserId(postId, userId);
    }
}
