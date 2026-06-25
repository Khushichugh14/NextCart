package com.nextcart.controller;

import com.nextcart.entity.Review;
import com.nextcart.entity.User;
import com.nextcart.repository.ReviewRepository;
import com.nextcart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewRepository.findByProductIdOrderByCreatedAtDesc(productId));
    }

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody Review request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .productId(request.getProductId())
                .userId(user.getId())
                .userName(user.getName())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(reviewRepository.save(review));
    }
}
