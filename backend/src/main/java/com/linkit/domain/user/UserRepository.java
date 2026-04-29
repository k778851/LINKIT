package com.linkit.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByHandle(String handle);
    boolean existsByHandle(String handle);
}
