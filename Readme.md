# sample-statistics

## Deploy

You need `Node.js 8+` to use the syntax `async` & `await` in the code. After the installation, work as following goes:

```javascript
git clone https://github.com/Yesterday17/sample-statistics
cd sample-statistics
npm install
```

Also, you need to edit `./public/index.html`. Find `http://localhost:8080/result` at `line 66`, and replace it with your subdomain.

Finally, you just need to start it.

```
npm start
```

It doesn't have a daemon process, so you need to use softwares such as screen to keep it running.

## Nginx

You need to configure nginx if you want to deploy it under a specific subdomain.  
Follow the steps and you can make it work.

1.  Point the subdomain's A record to your server.
2.  Create a file under `nginx/conf.d`, for example, named `duanwu.conf`.
3.  Edit the file.

```conf
server {
    listen 80;

    server_name <YOUR_SERVER_NAME>;

    location / {
             proxy_pass http://127.0.0.1:8080;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
   }
}
```

## Reference

1.  http://ningto.com/post/58e9dedd23fece2207bc73df
2.  http://zhangruojun.com/nginx-peizhi-erjiyuming/
