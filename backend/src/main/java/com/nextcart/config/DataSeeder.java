package com.nextcart.config;

import com.nextcart.entity.Product;
import com.nextcart.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            ObjectMapper mapper = new ObjectMapper();
            TypeReference<List<Product>> typeReference = new TypeReference<List<Product>>() {};
            InputStream inputStream = getClass().getResourceAsStream("/products.json");
            try {
                List<Product> products = mapper.readValue(inputStream, typeReference);
                productRepository.saveAll(products);
                System.out.println("Seeded H2 database with products.");
            } catch (Exception e) {
                System.out.println("Unable to seed database: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
