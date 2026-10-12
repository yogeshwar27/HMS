package com.medikiosk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MediKioskApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediKioskApplication.class, args);
        System.out.println("==================================================");
        System.out.println(" MediKiosk Hospital Backend is running on port 8081");
        System.out.println(" REST Endpoints: http://localhost:8081/api");
        System.out.println("==================================================");
    }
}
