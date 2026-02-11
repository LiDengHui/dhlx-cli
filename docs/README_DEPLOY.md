### 用于压缩指定目录并上传到服务器

```shell
  dhlx deploy -m dev
```

---

#### **Options:**

| 选项             | 参数         | 说明                             | 默认值                |
| ---------------- | ------------ | -------------------------------- | --------------------- |
| `-c, --config`   | `<file>`     | 指定配置文件路径                 | `./deployConfig.json` |
| `-m, --mode`     | `<mode>`     | 从配置文件中选择部署模式         | -                     |
| `-s, --source`   | `<dir>`      | 逗号分隔的目录列表，需要打包上传 | -                     |
| `-z, --zip`      | `<filename>` | 生成的 zip 文件名称              | `archive.zip`         |
| `-h, --host`     | `<host>`     | 目标服务器的 SSH 地址            | -                     |
| `-u, --user`     | `<user>`     | SSH 登录用户名                   | -                     |
| `-p, --password` | `<password>` | SSH 登录密码                     | -                     |
| `-r, --remote`   | `<path>`     | 服务器上的上传目录路径           | `/var/www/uploads`    |
| `-e, --extract`  | `<path>`     | 服务器上解压缩目录路径           | `/var/www/static`     |
| `--help`         | 无           | 显示帮助信息                     | -                     |

---

#### **示例用法**

##### **1. 使用默认配置文件进行部署**

```sh
dhlx deploy -s dist,public -h example.com -u admin -p password
```

此命令会：

1. 将 `dist` 和 `public` 目录压缩为 `archive.zip`
2. 上传到 `example.com` 服务器的 `/var/www/uploads`
3. 在 `/var/www/static` 目录下解压

---

#### **2. 指定配置文件**

```sh
dhlx deploy -c ./customConfig.json -m production
```

此命令使用 `customConfig.json` 进行部署，并选择 `production` 模式。

---

#### **3. 自定义压缩包名称**

```sh
dhlx deploy -s build -z myapp.zip -h 192.168.1.100 -u root -p secret
```

此命令会：

1. 将 `build` 目录打包为 `myapp.zip`
2. 上传到 `192.168.1.100` 的 `/var/www/uploads`
3. 在 `/var/www/static` 解压

### **4.使用配置方式**

项目根目录下创建deployConfig.json文件，并将该文件添加到.gitignore中不上传到代码库

```json
[
    {
        "mode": "dev",
        "source": "public",
        "host": "8.8.8.8",
        "password": "******",
        "user": "root",
        "remote": "/home/box/static/mini-app",
        "extract": "/home/box/static/mini-app"
    }
]
```

运行部署命令就会将source目录打包成zip包并上传服务器解压缩，要求服务器安装unzip解压缩工具

```shell
dhlx deploy -m dev
```
