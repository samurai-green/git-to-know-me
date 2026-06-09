---
title: Manual Containerization with Chroot
date: JUNE 08, 2026
readTime: 14 MIN READ
tags: SYSTEMS, CONTAINERIZATION, LINUX
summary: An advanced demonstration of manual containerization using chroot, system namespaces, and virtual mounts in ultra-embedded or constrained environments where Docker cannot run.
---

# Manual Containerization with Chroot

Modern DevOps relies heavily on high-level container runtimes like Docker, containerd, and Podman. However, in deeply constrained modern setups—such as hyper-secure microkernels, legacy server hardware, and ultra-small embedded systems—the resource overhead of running a Docker daemon is prohibitive or entirely unsupported.

When bulky container daemons cannot be used, engineers must build containerization from first principles.

The primitive foundation for jail-based isolation in Unix is `chroot` (change root). By combining `chroot` with modern Linux features like kernel namespaces, cgroups, and mounting tricks, we can achieve high-performance process isolation, custom directory routing, and network bindings manually.



## The Concept of a Chroot "Container"

A `chroot` operation alters the apparent root directory (`/`) for the current calling process and all subsequent children. Any process executed within this jail directory structure is walled off, unable to traverse up past the modified root boundary. 

While `chroot` provides file path containment, it does not inherently limit access to hardware resources, PIDs, or network interfaces on its own. To replicate what Docker does under the hood, we must manually configure:
1. **File System Isolation**: Constructing a minimal, self-contained root directory skeleton.
2. **Device Nodes & Virtual Filesystems**: Selectively mounting `/dev`, `/sys`, and `/proc`.
3. **Network Configurations**: Resolving hostnames and binding server applications to specific ports visible outside the jail.
4. **Namespace Segmentation (Optional but recommended)**: Separating process trees using `unshare`.



## Step 1: Building a Minimal Root File System

To assemble an environment that can run processes independently, we must build a typical UNIX directory hierarchy.

```bash
# Create the jail workspace and move into it
mkdir -p /opt/secure_jail
cd /opt/secure_jail

# Build the standard directory tree structure
mkdir -p bin sbin lib lib64 usr/bin usr/sbin var/log etc/network etc/ssl etc/auth
```

A raw program like `/bin/bash` cannot execute in isolation because it dynamically links to libraries in the base host's `/lib` and `/usr/lib`. We must identify and copy these dependencies:

```bash
# Verify shared library dependencies of bash
ldd /bin/bash
```

This output lists required shared objects (e.g., `libc.so.6`, `libtinfo.so.6`, and the dynamic linker `ld-linux-x86-64.so.2`). We must copy both `/bin/bash` and all its required absolute libraries into our matched paths inside `/opt/secure_jail`.

Alternatively, compiling programs statically on target or using minimal root environments like Alpine's static rootfs (`minirootfs`) bypasses manual copying and results in a highly optimized container file system of less than 5MB.



## Step 2: Virtual Mount Points & Device Bindings

Many system programs rely on access to the system hardware, process lists, and kernel state. Since no boot sequence is ran, these virtual directories do not populate automatically. We must bind-mount elements from our host system:

```bash
# Create virtual mount points inside our jail
mkdir -p proc sys dev

# Mount /dev to share the base hardware configuration
mount --bind /dev dev

# Mount sysfs to communicate system/driver state
mount -t sysfs sysfs sys

# Mount proc to expose current active process tables
mount -t proc proc proc
```

### Why Bound Mounts are Crucial
Without binding `/dev`, utilities that write random noise, query disk partitions, or utilize serial interfaces will crash due to missing file descriptors. Similarly, mounting `proc` allows tools like `ps` or `top` inside the jail to view active runtime operations.



## Step 3: Network Bindings and Host Resolution

When executing server listeners or making requests out of a `chroot`, hostname lookups will fail because the jail environment lacks DNS resolving libraries and configurations.

We manually copy these parameters to align network interfaces:

```bash
# Copy host resolving lists into the jail structure
cp /etc/resolv.conf /opt/secure_jail/etc/resolv.conf
cp /etc/hosts /opt/secure_jail/etc/hosts
```

If the container system uses DHCP or needs a distinct address spacing, we can provision a separate routing interface or pull an address manually outside the jail, specifying routing rules to guide packets directly into the jail's virtual interfaces.



## Step 4: Entering the Jail

With the directory, dependencies, mounts, and network resolved, we execute the `chroot` command:

```bash
# Enter the secure chroot environment specifying bash as the entrypoint
chroot /opt/secure_jail /bin/bash
```

The shell prompt will transform to indicate that the running environment treats `/opt/secure_jail` as its global `/` root. Commands such as `ls /` will display only the internal directories created earlier.



## Step 5: Process and Port Exposure

To run a server daemon (like a web controller or a lightweight database) inside our jail and expose it to the host on port `8080`, we compile our server binary statically and drop it into `usr/bin/`.

Here is a secure Go raw TCP socket listener that serves raw system metrics over a defined port, written to be run entirely inside a chroot:

```go
package main

import (
	"fmt"
	"net"
	"os"
)

func main() {
	// Bind to all interfaces inside the jail on port 8080
	listener, err := net.Listen("tcp", "0.0.0.0:8080")
	if err != nil {
		fmt.Printf("Fatal: failed to bind socket: %v\n", err)
		os.Exit(1)
	}
	defer listener.Close()
	fmt.Println("Metric controller online inside jail on port 8080...")

	for {
		conn, err := listener.Accept()
		if err != nil {
			continue
		}
		go handleConnection(conn)
	}
}

func handleConnection(conn net.Conn) {
	defer conn.Close()
	// Return a clean metrics string
	payload := "CHROOT_ENVIRONMENT: ONLINE\nUPTIME: VERIFIED\nSTATUS: ISOLATED\n"
	conn.Write([]byte(payload))
}
```

By starting this binary inside our `chroot` shell:
```bash
/usr/bin/metric_server &
```

The application binds to port 8080. Since network spaces are transparent when using standard `chroot` without namespace restrictions, clients on the external local area network can communicate with the server directly by hitting the host IP address on port `8080`.



## Step 6: Advanced Multi-Level Docker Alternatives

To upgrade our `chroot` from a simple directory jail to a fully isolated container equivalent to a Docker container, we can utilize `unshare` to isolate processes (PIDs), Mounts, and Network configurations:

```bash
# Execute bash inside a new PID, Mount, and Network namespace, then run chroot
unshare --fork --pid --mount --net chroot /opt/secure_jail /bin/bash
```

This single command isolates the container in three dimensions, reproducing Docker's isolation guarantees without requiring a runtime daemon or background container managers:
* `--pid`: Hides host process hierarchies. `ps` will only see jail-specific tasks.
* `--net`: Creates a virtual loopback interface separate from host networks.
* `--mount`: Secures mounts so changes inside the jail do not leak to host filesystems.
