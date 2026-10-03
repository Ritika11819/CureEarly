package com.curearly.auth;
import com.curearly.patient.Patient;
import com.curearly.patient.PatientRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class GoogleOAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final PatientRepository patients; private final AuthController auth; private final String frontendUrl;
    public GoogleOAuthSuccessHandler(PatientRepository patients, AuthController auth, @Value("${app.frontend-url}") String frontendUrl) { this.patients=patients;this.auth=auth;this.frontendUrl=frontendUrl; }
    @Override public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User user=(OAuth2User)authentication.getPrincipal(); Map<String,Object> a=user.getAttributes(); String sub=(String)a.get("sub"); String email=(String)a.get("email");
        if(sub==null || email==null) { response.sendError(401,"Google did not provide an email address"); return; }
        Patient p=patients.findByGoogleSubject(sub).orElseGet(()->patients.findByEmail(email.toLowerCase()).orElseGet(Patient::new));
        p.setGoogleSubject(sub); p.setEmail(email); p.setFullName((String)a.getOrDefault("name",email)); p.setAuthProvider("GOOGLE"); p.touch(); patients.save(p); auth.setSession(response,p); getRedirectStrategy().sendRedirect(request,response,frontendUrl+"/patient-profile");
    }
}
