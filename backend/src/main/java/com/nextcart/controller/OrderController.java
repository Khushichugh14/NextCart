package com.nextcart.controller;

import com.nextcart.entity.Order;
import com.nextcart.entity.User;
import com.nextcart.repository.OrderRepository;
import com.nextcart.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            double amount = Double.parseDouble(data.get("amount").toString());
            String currency = data.getOrDefault("currency", "USD").toString();

            // Create Razorpay client
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Calculate amount in lowest denomination (e.g. cents/paise)
            int amountInLowestDenomination = (int) (amount * 100);

            // Create Razorpay order
            JSONObject options = new JSONObject();
            options.put("amount", amountInLowestDenomination);
            options.put("currency", currency);
            options.put("receipt", "txn_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(options);

            // Save order in DB
            Order myOrder = Order.builder()
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .status("CREATED")
                    .userId(user.getId())
                    .amount(amount)
                    .currency(currency)
                    .receipt(options.getString("receipt"))
                    .build();

            orderRepository.save(myOrder);

            return ResponseEntity.ok(Map.<String, Object>of(
                    "id", razorpayOrder.get("id"),
                    "amount", razorpayOrder.get("amount"),
                    "currency", razorpayOrder.get("currency"),
                    "keyId", razorpayKeyId
            ));

        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Throwable e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload) {
        try {
            String razorpayOrderId = payload.get("razorpay_order_id");
            String razorpayPaymentId = payload.get("razorpay_payment_id");
            String razorpaySignature = payload.get("razorpay_signature");

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                        .orElseThrow(() -> new RuntimeException("Order not found"));
                
                order.setRazorpayPaymentId(razorpayPaymentId);
                order.setStatus("PAID");
                orderRepository.save(order);
                
                return ResponseEntity.ok(Map.of("status", "success"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid signature"));
            }
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
