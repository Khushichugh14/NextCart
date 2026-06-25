package com.nextcart.repository;

import com.nextcart.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
}
