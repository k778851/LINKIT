package com.linkit.domain.webpush;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    List<PushSubscription> findByUserId(String userId);

    Optional<PushSubscription> findByUserIdAndEndpoint(String userId, String endpoint);

    void deleteByUserIdAndEndpoint(String userId, String endpoint);

    boolean existsByUserIdAndEndpoint(String userId, String endpoint);
}
