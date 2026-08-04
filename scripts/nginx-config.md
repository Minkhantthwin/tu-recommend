server {
    server_name api.tu-recommend.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.tu-recommend.online/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.tu-recommend.online/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}

# MinIO API (for file uploads)
server {
    server_name storage.tu-recommend.online;

    # Allow large file uploads
    client_max_body_size 100M;

    # Important: Ignore invalid headers from MinIO
    ignore_invalid_headers off;
    
    # Allow any size object
    proxy_buffering off;
    proxy_request_buffering off;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Important for MinIO
        proxy_set_header Connection "";
        chunked_transfer_encoding off;
        
        # CORS headers for file access
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.tu-recommend.online/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.tu-recommend.online/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;


}

# MinIO Console (Admin UI)
server {
    server_name console.tu-recommend.online;

    location / {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.tu-recommend.online/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.tu-recommend.online/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

}

server {
    if ($host = console.tu-recommend.online) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name console.tu-recommend.online;
    return 404;


}

server {
    if ($host = api.tu-recommend.online) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name api.tu-recommend.online;
    return 404; # managed by Certbot


}
server {
    if ($host = storage.tu-recommend.online) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name storage.tu-recommend.online;
    return 404; # managed by Certbot


}
