server {
    server_name    45-33-16-100.ip.linodeusercontent.com www.45-33-16-100.ip.linodeusercontent.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }



    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/45-33-16-100.ip.linodeusercontent.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/45-33-16-100.ip.linodeusercontent.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = 45-33-16-100.ip.linodeusercontent.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    server_name    45-33-16-100.ip.linodeusercontent.com www.45-33-16-100.ip.linodeusercontent.com;
    listen 80;
    return 404; # managed by Certbot


}