package com.example.demo.adminController;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.adminModel.adminModel;
import com.example.demo.adminRepository.adminRepository;

@RestController
@RequestMapping("/api/v1/")
@CrossOrigin(origins = {"http://localhost", "http://localhost:4200", "http://localhost:80", "http://34.228.7.104"}, allowCredentials = "true")
public class adminController {
    
    @Autowired
    private adminRepository repo;
    
    // Get all admins
    @GetMapping("/admin")
    public List<adminModel> getAllAdmins(){
        return repo.findAll();
    }
    
    // Register new admin
    @PostMapping("/admin/register")
    public ResponseEntity<adminModel> registerAdmin(@RequestBody adminModel admin){
        adminModel savedAdmin = repo.save(admin);
        return ResponseEntity.ok(savedAdmin);
    }
    
    // Login admin
    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody adminModel admin){
        List<adminModel> admins = repo.findAll();
        
        for(adminModel existingAdmin : admins){
            if(existingAdmin.getAdminName().equals(admin.getAdminName()) && 
               existingAdmin.getAdminPassword().equals(admin.getAdminPassword())){
                return ResponseEntity.ok(new LoginResponse("Login successful", existingAdmin));
            }
        }
        
        return ResponseEntity.status(401).body(new LoginResponse("Invalid credentials", null));
    }
    
    // Response class for login
    public static class LoginResponse {
        public String message;
        public adminModel admin;
        
        public LoginResponse(String message, adminModel admin) {
            this.message = message;
            this.admin = admin;
        }
    }
}
