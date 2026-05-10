package com.linkit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LinkitApplication {
    public static void main(String[] args) {
        SpringApplication.run(LinkitApplication.class, args);
    }
}
