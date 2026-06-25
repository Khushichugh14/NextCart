package com.nextcart.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String category;
    private Double price;
    
    @Column(length = 2048)
    private String imageUrl;
    
    @Column(length = 2048)
    private String description;
}
