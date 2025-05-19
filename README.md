# DevOps Project: video-converter 🎥➡️🎵  
Converting `.mp4` videos to `.mp3` in a microservices architecture.
![ProjectArchitecture](https://github.com/user-attachments/assets/548d2b5f-df8d-4202-8769-8d891b77f310)

---

## 🏗️ Architecture

Deploying a Python-based Microservice Application on AWS EKS

![Architecture Diagram](Architecture.png) <!-- Add your diagram file here -->

---

## 📘 Introduction

This guide provides step-by-step instructions to deploy a Python-based microservice application on **AWS EKS**.  
It includes the following microservices:

- `auth-server`
- `converter-module`
- `database-server` (PostgreSQL and MongoDB)
- `notification-server`

---

## ✅ Prerequisites

- AWS Account
- Helm (Kubernetes package manager)
- Python installed
- AWS CLI
- kubectl
- PostgreSQL and MongoDB setup

---

## 🔄 High-Level Deployment Flow

1. **MongoDB & PostgreSQL Setup**
2. **RabbitMQ Deployment**  
   - Create queues `mp3` and `video`
3. **Deploy Microservices**
   - `auth-server`
   - `gateway-server`
   - `converter-module` (update `secret.yaml`)
   - `notification-server` (configure email & 2FA)
4. **Validation**
   ```bash
   kubectl get all
   ```

## 🔧 Low-Level Steps

### 🌐 Cluster Creation

#### 1. Login to AWS Console

Use root credentials to access AWS Management Console.

#### 2. IAM Role: eksCluster

* Follow AWS docs to create `eksCluster` IAM Role.
* Attach policy `AmazonEKS_CNI_Policy` (if not added by default).
![ekscluster_role](https://github.com/user-attachments/assets/472f06b9-249e-455f-b80a-9f57bf94f108)

#### 3. IAM Role: AmazonEKSNodeRole

* Follow AWS docs to create this role.
* Attach policies:

  * `AmazonEKS_CNI_Policy`
  * `AmazonEBSCSIDriverPolicy`
  * `AmazonEC2ContainerRegistryReadOnly`
![node_iam](https://github.com/user-attachments/assets/d821dec7-4ea0-4323-90d8-c3158d4a5ed2)

#### 4. EKS Cluster Setup

* Open EKS Dashboard → Click **"Create Cluster"**
* Configure:

  * Name, VPC/Subnet, IAM Role (eksCluster)
* Wait for status = `Active`

#### 5. Node Group Creation

* Add node group (e.g., `t3.medium`, AMI = default)
* Allow necessary **inbound rules** (e.g., 30001-30006)
![inbound_rules_sg](https://github.com/user-attachments/assets/6fcea202-986c-48f4-844c-295a5e3b97aa)
#### 6. Enable EBS CSI Add-on

* Enable from Add-ons → used for PVC (PersistentVolumeClaim)
![ebs_addon](https://github.com/user-attachments/assets/b6f76b8d-6199-4221-93d1-e1e2a2146a5d)


---

## 🚀 Deploying Application on EKS

### Step 1: Clone the repository

```bash
git clone https://github.com/your-repo/video-converter.git
cd video-converter
```

### Step 2: Set Cluster Context

```bash
aws eks update-kubeconfig --name <cluster_name> --region <aws_region>
```

---

## ⚙️ Kubernetes Component Commands

### MongoDB

```bash
cd Helm_charts/MongoDB
# Set username/password in values.yaml
helm install mongo .
```

Connect:

```bash
mongosh mongodb://<username>:<pwd>@<nodeip>:30005/mp3s?authSource=admin
```

### PostgreSQL

```bash
cd ..
cd Postgres
# Set username/password in values.yaml
helm install postgres .
```

Connect:

```bash
psql 'postgres://<username>:<pwd>@<nodeip>:30003/authdb'
```

### RabbitMQ

```bash
cd ..
cd RabbitMQ
helm install rabbitmq .
```

Create Queues:
Go to `<nodeIP>:30004`
Login: `guest / guest`
Create Queues: `mp3` and `video`

---

## 📦 Deploy Microservices

```bash
# Auth Service
cd auth-service/manifest
kubectl apply -f .

# Gateway Service
cd ../../gateway-service/manifest
kubectl apply -f .

# Converter Service
cd ../../converter-service/manifest
# Add email/password in secret.yaml
kubectl apply -f .

# Notification Service
cd ../../notification-service/manifest
kubectl apply -f .
```

---

## ✅ Application Validation

```bash
kubectl get all
```

---

## ✉️ Notification Configuration (Email + 2FA)

1. Go to your **Gmail Account** → **Manage Your Google Account**
2. Navigate to **Security Tab**
3. Enable **2-Step Verification**
4. Search for **App Passwords**
5. Generate a new app password (type: Other)
6. Copy and paste the password in:

```yaml
notification-service/manifest/secret.yaml
```

---

## 🧪 API Testing

### 🔐 Login

```bash
curl -X POST http://<nodeIP>:30002/login -u <email>:<password>
```

### 📤 Upload

```bash
curl -X POST -F 'file=@./video.mp4' \
  -H 'Authorization: Bearer <JWT Token>' \
  http://<nodeIP>:30002/upload
```

### 📥 Download

```bash
curl --output video.mp3 -X GET \
  -H 'Authorization: Bearer <JWT Token>' \
  "http://<nodeIP>:30002/download?fid=<Generated_FID>"
```

---

## 🔚 Destroying the Infrastructure

1. **Delete Node Group** from AWS EKS Console
2. **Delete EKS Cluster**

---

## 📸 Screenshots / Diagrams

> Add these files to your repo and reference them as needed:

* `Architecture.png`
* `ekscluster_role.png`
* `Node_IAM.png`
* `Inbound_rules_sg.png`
* `ebs_addon.png`

---

## 📎 License

MIT License

---

## 👨‍💻 Author

Aniket Purohit – [LinkedIn](https://www.linkedin.com/in/aniket-purohit/)

```

Let me know if you'd like me to generate this as a file or add badges, live demo links, or GitHub Actions CI setup too!
```
