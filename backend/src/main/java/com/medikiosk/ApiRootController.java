package com.medikiosk;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiRootController {

    @GetMapping({"/", "/api"})
    public Map<String, Object> home() {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("application", "MediKiosk Hospital Backend");
response.put("status", "UP");
response.put("message", "Backend is running successfully");
response.put("appointmentsEndpoint", "/api/appointments");

            
        return response;
    }
}