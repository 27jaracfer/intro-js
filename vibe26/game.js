class FightingGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Game state
        this.playerHealth = 100;
        this.opponentHealth = 100;
        this.round = 1;
        this.timeLeft = 60;
        this.isGameActive = true;
        this.playerWins = 0;
        this.opponentWins = 0;
        this.maxRounds = 3;
        this.level = 1;
        this.opponentSpeed = 0.3; // Base opponent speed
        this.opponentAttackSpeed = 0.02; // Base attack frequency
        this.opponentAttackCooldown = 20; // Base attack cooldown
        this.spears = []; // Array to track active spears
        this.spearSpeed = 0.5; // Base spear speed
        this.spearCooldown = 0; // Cooldown for spear throwing
        this.opponentDamageMultiplier = 1; // Base damage multiplier

        // Movement and combat state
        this.moveSpeed = 0.5;
        this.jumpForce = 0.6;
        this.isPunching = false;
        this.isKicking = false;
        this.isBlocking = false;
        this.leftPunchCooldown = 0;
        this.rightPunchCooldown = 0;
        this.highKickCooldown = 0;
        this.blockCooldown = 0;
        this.attackRange = 2;
        this.opponentBlockCooldown = 0;
        this.opponentIsBlocking = false;
        this.hasJumped = false;
        this.isGrounded = true;

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Create arena
        this.createArena();

        // Create characters
        this.createCharacters();

        // Set camera position
        this.camera.position.set(0, 3, 6);
        this.camera.lookAt(0, 0, 0);

        // Start game loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Handle keyboard input
        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    createArena() {
        // Create floor (smaller arena)
        const floorGeometry = new THREE.PlaneGeometry(10, 10); // Reduced from 20x20 to 10x10
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0; // Ensure floor is at y=0
        this.scene.add(floor);

        // Create arena boundaries (smaller walls)
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x404040,
            transparent: true,
            opacity: 0.5
        });

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 3), // Reduced from 20x5 to 10x3
            wallMaterial
        );
        backWall.position.z = -5; // Adjusted from -10 to -5
        this.scene.add(backWall);

        // Side walls
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 3), // Reduced from 20x5 to 10x3
            wallMaterial
        );
        leftWall.position.x = -5; // Adjusted from -10 to -5
        leftWall.rotation.y = Math.PI / 2;
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 3), // Reduced from 20x5 to 10x3
            wallMaterial
        );
        rightWall.position.x = 5; // Adjusted from 10 to 5
        rightWall.rotation.y = -Math.PI / 2;
        this.scene.add(rightWall);
    }

    createCharacters() {
        // Create player character (blue)
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        
        // Create player's body (more human-like proportions)
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16); // Slimmer torso
        this.player = new THREE.Mesh(bodyGeometry, playerMaterial);
        this.player.position.set(-2, 0.4, 0); // Adjusted position to be lower and closer
        this.scene.add(this.player);

        // Create player's neck
        const neckGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8);
        this.playerNeck = new THREE.Mesh(neckGeometry, playerMaterial);
        this.playerNeck.position.set(0, 0.6, 0);
        this.player.add(this.playerNeck);

        // Create player's head (more proportional)
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        this.playerHead = new THREE.Mesh(headGeometry, playerMaterial);
        this.playerHead.position.set(0, 0.8, 0);
        this.player.add(this.playerHead);

        // Create player's shoulders
        const shoulderGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
        this.playerLeftShoulder = new THREE.Mesh(shoulderGeometry, playerMaterial);
        this.playerLeftShoulder.position.set(-0.2, 0.8, 0);
        this.playerLeftShoulder.rotation.z = Math.PI / 2;
        this.player.add(this.playerLeftShoulder);

        this.playerRightShoulder = new THREE.Mesh(shoulderGeometry, playerMaterial);
        this.playerRightShoulder.position.set(0.2, 0.8, 0);
        this.playerRightShoulder.rotation.z = -Math.PI / 2;
        this.player.add(this.playerRightShoulder);

        // Create player's arms with elbows and hands
        // Left upper arm
        this.playerLeftUpperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8),
            playerMaterial
        );
        this.playerLeftUpperArm.position.set(-0.3, 0, 0);
        this.playerLeftUpperArm.rotation.z = Math.PI / 2;
        this.playerLeftShoulder.add(this.playerLeftUpperArm);

        // Left elbow (smaller and blended)
        this.playerLeftElbow = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            playerMaterial
        );
        this.playerLeftElbow.position.set(-0.3, 0, 0);
        this.playerLeftUpperArm.add(this.playerLeftElbow);

        // Left forearm
        this.playerLeftForearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8),
            playerMaterial
        );
        this.playerLeftForearm.position.set(-0.3, 0, 0);
        this.playerLeftElbow.add(this.playerLeftForearm);

        // Left hand
        this.playerLeftHand = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            playerMaterial
        );
        this.playerLeftHand.position.set(-0.25, 0, 0);
        this.playerLeftForearm.add(this.playerLeftHand);

        // Right upper arm
        this.playerRightUpperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8),
            playerMaterial
        );
        this.playerRightUpperArm.position.set(0.3, 0, 0);
        this.playerRightUpperArm.rotation.z = -Math.PI / 2;
        this.playerRightShoulder.add(this.playerRightUpperArm);

        // Right elbow (smaller and blended)
        this.playerRightElbow = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            playerMaterial
        );
        this.playerRightElbow.position.set(0.3, 0, 0);
        this.playerRightUpperArm.add(this.playerRightElbow);

        // Right forearm
        this.playerRightForearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8),
            playerMaterial
        );
        this.playerRightForearm.position.set(0.3, 0, 0);
        this.playerRightElbow.add(this.playerRightForearm);

        // Right hand
        this.playerRightHand = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            playerMaterial
        );
        this.playerRightHand.position.set(0.25, 0, 0);
        this.playerRightForearm.add(this.playerRightHand);

        // Create player's hips
        const hipGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
        this.playerHips = new THREE.Mesh(hipGeometry, playerMaterial);
        this.playerHips.position.set(0, 0.4, 0);
        this.player.add(this.playerHips);

        // Create player's legs with knees and feet
        // Left thigh
        this.playerLeftThigh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8),
            playerMaterial
        );
        this.playerLeftThigh.position.set(-0.15, 0.3, 0);
        this.playerLeftThigh.rotation.z = Math.PI / 6; // Angle the leg outward
        this.player.add(this.playerLeftThigh);

        // Left knee (smaller and blended)
        this.playerLeftKnee = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            playerMaterial
        );
        this.playerLeftKnee.position.set(0, -0.12, 0);
        this.playerLeftThigh.add(this.playerLeftKnee);

        // Left calf
        this.playerLeftCalf = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8),
            playerMaterial
        );
        this.playerLeftCalf.position.set(0, -0.2, 0);
        this.playerLeftKnee.add(this.playerLeftCalf);

        // Left foot
        this.playerLeftFoot = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.06, 0.2),
            playerMaterial
        );
        this.playerLeftFoot.position.set(0, -0.2, 0);
        this.playerLeftCalf.add(this.playerLeftFoot);

        // Right thigh
        this.playerRightThigh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8),
            playerMaterial
        );
        this.playerRightThigh.position.set(0.15, 0.3, 0);
        this.playerRightThigh.rotation.z = -Math.PI / 6; // Angle the leg outward
        this.player.add(this.playerRightThigh);

        // Right knee (smaller and blended)
        this.playerRightKnee = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            playerMaterial
        );
        this.playerRightKnee.position.set(0, -0.12, 0);
        this.playerRightThigh.add(this.playerRightKnee);

        // Right calf
        this.playerRightCalf = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8),
            playerMaterial
        );
        this.playerRightCalf.position.set(0, -0.2, 0);
        this.playerRightKnee.add(this.playerRightCalf);

        // Right foot
        this.playerRightFoot = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.06, 0.2),
            playerMaterial
        );
        this.playerRightFoot.position.set(0, -0.2, 0);
        this.playerRightCalf.add(this.playerRightFoot);

        // Create opponent character (red) with similar structure
        const opponentMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        
        // Create opponent's body
        const opponentBodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16);
        this.opponent = new THREE.Mesh(opponentBodyGeometry, opponentMaterial);
        this.opponent.position.set(2, 0.4, 0); // Adjusted position to be lower and closer
        this.scene.add(this.opponent);

        // Create opponent's neck
        const opponentNeckGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8);
        this.opponentNeck = new THREE.Mesh(opponentNeckGeometry, opponentMaterial);
        this.opponentNeck.position.set(0, 0.6, 0);
        this.opponent.add(this.opponentNeck);

        // Create opponent's head
        const opponentHeadGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        this.opponentHead = new THREE.Mesh(opponentHeadGeometry, opponentMaterial);
        this.opponentHead.position.set(0, 0.8, 0);
        this.opponent.add(this.opponentHead);

        // Create opponent's shoulders
        const opponentShoulderGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
        this.opponentLeftShoulder = new THREE.Mesh(opponentShoulderGeometry, opponentMaterial);
        this.opponentLeftShoulder.position.set(-0.2, 0.8, 0);
        this.opponentLeftShoulder.rotation.z = Math.PI / 2;
        this.opponent.add(this.opponentLeftShoulder);

        this.opponentRightShoulder = new THREE.Mesh(opponentShoulderGeometry, opponentMaterial);
        this.opponentRightShoulder.position.set(0.2, 0.8, 0);
        this.opponentRightShoulder.rotation.z = -Math.PI / 2;
        this.opponent.add(this.opponentRightShoulder);

        // Create opponent's arms with elbows and hands
        // Left upper arm
        this.opponentLeftUpperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8),
            opponentMaterial
        );
        this.opponentLeftUpperArm.position.set(-0.3, 0, 0);
        this.opponentLeftUpperArm.rotation.z = Math.PI / 2;
        this.opponentLeftShoulder.add(this.opponentLeftUpperArm);

        // Left elbow (smaller and blended)
        this.opponentLeftElbow = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            opponentMaterial
        );
        this.opponentLeftElbow.position.set(-0.3, 0, 0);
        this.opponentLeftUpperArm.add(this.opponentLeftElbow);

        // Left forearm
        this.opponentLeftForearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8),
            opponentMaterial
        );
        this.opponentLeftForearm.position.set(-0.3, 0, 0);
        this.opponentLeftElbow.add(this.opponentLeftForearm);

        // Left hand
        this.opponentLeftHand = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            opponentMaterial
        );
        this.opponentLeftHand.position.set(-0.25, 0, 0);
        this.opponentLeftForearm.add(this.opponentLeftHand);

        // Right upper arm
        this.opponentRightUpperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8),
            opponentMaterial
        );
        this.opponentRightUpperArm.position.set(0.3, 0, 0);
        this.opponentRightUpperArm.rotation.z = -Math.PI / 2;
        this.opponentRightShoulder.add(this.opponentRightUpperArm);

        // Right elbow (smaller and blended)
        this.opponentRightElbow = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            opponentMaterial
        );
        this.opponentRightElbow.position.set(0.3, 0, 0);
        this.opponentRightUpperArm.add(this.opponentRightElbow);

        // Right forearm
        this.opponentRightForearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8),
            opponentMaterial
        );
        this.opponentRightForearm.position.set(0.3, 0, 0);
        this.opponentRightElbow.add(this.opponentRightForearm);

        // Right hand
        this.opponentRightHand = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            opponentMaterial
        );
        this.opponentRightHand.position.set(0.25, 0, 0);
        this.opponentRightForearm.add(this.opponentRightHand);

        // Create opponent's hips
        const opponentHipGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
        this.opponentHips = new THREE.Mesh(opponentHipGeometry, opponentMaterial);
        this.opponentHips.position.set(0, 0.4, 0);
        this.opponent.add(this.opponentHips);

        // Create opponent's legs with knees and feet
        // Left thigh
        this.opponentLeftThigh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8),
            opponentMaterial
        );
        this.opponentLeftThigh.position.set(-0.15, 0.3, 0);
        this.opponentLeftThigh.rotation.z = Math.PI / 6; // Angle the leg outward
        this.opponent.add(this.opponentLeftThigh);

        // Left knee (smaller and blended)
        this.opponentLeftKnee = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            opponentMaterial
        );
        this.opponentLeftKnee.position.set(0, -0.12, 0);
        this.opponentLeftThigh.add(this.opponentLeftKnee);

        // Left calf
        this.opponentLeftCalf = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8),
            opponentMaterial
        );
        this.opponentLeftCalf.position.set(0, -0.2, 0);
        this.opponentLeftKnee.add(this.opponentLeftCalf);

        // Left foot
        this.opponentLeftFoot = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.06, 0.2),
            opponentMaterial
        );
        this.opponentLeftFoot.position.set(0, -0.2, 0);
        this.opponentLeftCalf.add(this.opponentLeftFoot);

        // Right thigh
        this.opponentRightThigh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8),
            opponentMaterial
        );
        this.opponentRightThigh.position.set(0.15, 0.3, 0);
        this.opponentRightThigh.rotation.z = -Math.PI / 6; // Angle the leg outward
        this.opponent.add(this.opponentRightThigh);

        // Right knee (smaller and blended)
        this.opponentRightKnee = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            opponentMaterial
        );
        this.opponentRightKnee.position.set(0, -0.12, 0);
        this.opponentRightThigh.add(this.opponentRightKnee);

        // Right calf
        this.opponentRightCalf = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8),
            opponentMaterial
        );
        this.opponentRightCalf.position.set(0, -0.2, 0);
        this.opponentRightKnee.add(this.opponentRightCalf);

        // Right foot
        this.opponentRightFoot = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.06, 0.2),
            opponentMaterial
        );
        this.opponentRightFoot.position.set(0, -0.2, 0);
        this.opponentRightCalf.add(this.opponentRightFoot);
    }

    handleKeyDown(event) {
        if (!this.isGameActive) return;

        switch(event.key.toLowerCase()) {
            case 'a':
                this.player.position.x -= this.moveSpeed;
                break;
            case 'd':
                this.player.position.x += this.moveSpeed;
                break;
            case 'w':
                this.player.position.z -= this.moveSpeed;
                break;
            case 's':
                this.player.position.z += this.moveSpeed;
                break;
            case ' ':
                // Jump only once when grounded
                if (this.isGrounded && !this.hasJumped) {
                    this.player.position.y += this.jumpForce;
                    this.hasJumped = true;
                    this.isGrounded = false;
                    setTimeout(() => {
                        this.player.position.y = 0.4; // Return to ground level
                        this.isGrounded = true;
                        this.hasJumped = false;
                    }, 300); // Faster jump duration
                }
                break;
            case 'e': // Left punch
                if (this.leftPunchCooldown <= 0) {
                    this.isPunching = true;
                    this.leftPunchCooldown = 10; // Reduced cooldown
                    this.leftPunch();
                }
                break;
            case 'r': // Right punch
                if (this.rightPunchCooldown <= 0) {
                    this.isPunching = true;
                    this.rightPunchCooldown = 10; // Reduced cooldown
                    this.rightPunch();
                }
                break;
            case 'f': // High kick
                if (this.highKickCooldown <= 0) {
                    this.isKicking = true;
                    this.highKickCooldown = 15; // Reduced cooldown
                    this.highKick();
                }
                break;
            case 'q': // Block
                if (this.blockCooldown <= 0) {
                    this.isBlocking = true;
                    this.blockCooldown = 8; // Reduced cooldown
                    this.block();
                }
                break;
        }
    }

    handleKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'e':
            case 'r':
                this.isPunching = false;
                break;
            case 'f':
                this.isKicking = false;
                break;
            case 'q':
                this.isBlocking = false;
                break;
        }
    }

    leftPunch() {
        // Animate left punch with proper arm and hand movement
        this.playerLeftUpperArm.rotation.x = -Math.PI / 2;
        this.playerLeftElbow.rotation.x = -Math.PI / 2;
        this.playerLeftHand.rotation.x = -Math.PI / 2;
        
        // Check for hit
        const distance = this.player.position.distanceTo(this.opponent.position);
        if (distance < this.attackRange) {
            if (this.opponentIsBlocking) {
                this.opponentHealth -= 5;
                this.createHitEffect(this.opponent.position, 0x00ff00);
            } else {
                this.opponentHealth -= 20;
                this.createHitEffect(this.opponent.position);
            }
        }

        // Reset arm and hand position after animation
        setTimeout(() => {
            this.playerLeftUpperArm.rotation.x = 0;
            this.playerLeftElbow.rotation.x = 0;
            this.playerLeftHand.rotation.x = 0;
        }, 100);
    }

    rightPunch() {
        // Animate right punch with proper arm and hand movement
        this.playerRightUpperArm.rotation.x = -Math.PI / 2;
        this.playerRightElbow.rotation.x = -Math.PI / 2;
        this.playerRightHand.rotation.x = -Math.PI / 2;
        
        // Check for hit
        const distance = this.player.position.distanceTo(this.opponent.position);
        if (distance < this.attackRange) {
            if (this.opponentIsBlocking) {
                this.opponentHealth -= 5;
                this.createHitEffect(this.opponent.position, 0x00ff00);
            } else {
                this.opponentHealth -= 20;
                this.createHitEffect(this.opponent.position);
            }
        }

        // Reset arm and hand position after animation
        setTimeout(() => {
            this.playerRightUpperArm.rotation.x = 0;
            this.playerRightElbow.rotation.x = 0;
            this.playerRightHand.rotation.x = 0;
        }, 100);
    }

    highKick() {
        // Animate high kick with proper leg and foot movement
        this.playerLeftThigh.rotation.x = -Math.PI / 2;
        this.playerRightThigh.rotation.x = -Math.PI / 2;
        this.playerLeftCalf.rotation.x = -Math.PI / 2;
        this.playerRightCalf.rotation.x = -Math.PI / 2;
        
        // Check for hit
        const distance = this.player.position.distanceTo(this.opponent.position);
        if (distance < this.attackRange) {
            if (this.opponentIsBlocking) {
                this.opponentHealth -= 5;
                this.createHitEffect(this.opponent.position, 0x00ff00);
            } else {
                this.opponentHealth -= 20;
                this.createHitEffect(this.opponent.position);
            }
        }

        // Reset leg and foot positions after animation
        setTimeout(() => {
            this.playerLeftThigh.rotation.x = 0;
            this.playerRightThigh.rotation.x = 0;
            this.playerLeftCalf.rotation.x = 0;
            this.playerRightCalf.rotation.x = 0;
        }, 150);
    }

    block() {
        // Animate blocking stance
        this.playerLeftUpperArm.rotation.x = -Math.PI / 4;
        this.playerRightUpperArm.rotation.x = -Math.PI / 4;
        this.playerLeftForearm.rotation.x = -Math.PI / 4;
        this.playerRightForearm.rotation.x = -Math.PI / 4;
        
        // Reset arm positions after animation
        setTimeout(() => {
            if (!this.isBlocking) {
                this.playerLeftUpperArm.rotation.x = 0;
                this.playerRightUpperArm.rotation.x = 0;
                this.playerLeftForearm.rotation.x = 0;
                this.playerRightForearm.rotation.x = 0;
            }
        }, 100); // Faster animation
    }

    createHitEffect(position, color = 0xffff00) {
        // Create a temporary flash effect
        const flashGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 1
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(position);
        this.scene.add(flash);

        // Animate and remove the flash
        let opacity = 1;
        const animate = () => {
            opacity -= 0.1;
            flashMaterial.opacity = opacity;
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(flash);
            }
        };
        animate();
    }

    updateGameState() {
        // Update health bars
        const playerHealthBar = document.getElementById('player-health');
        const opponentHealthBar = document.getElementById('opponent-health');
        
        // Update health values
        playerHealthBar.setAttribute('data-health', this.playerHealth);
        opponentHealthBar.setAttribute('data-health', this.opponentHealth);
        
        // Update health bar widths
        playerHealthBar.style.setProperty('--health', `${this.playerHealth}%`);
        opponentHealthBar.style.setProperty('--health', `${this.opponentHealth}%`);
        
        // Update round info
        const roundInfo = document.getElementById('round-info');
        roundInfo.textContent = `Level ${this.level} - Round ${this.round} | Wins: ${this.playerWins}`;
        
        // Update timer
        const timer = document.getElementById('timer');
        timer.textContent = `Time: ${Math.ceil(this.timeLeft)}`;
        
        // Add star indicator for wins
        const playerHealthContainer = playerHealthBar.parentElement;
        let starContainer = playerHealthContainer.querySelector('.win-star');
        
        if (this.playerWins > 0) {
            if (!starContainer) {
                starContainer = document.createElement('div');
                starContainer.className = 'win-star';
                starContainer.textContent = '★';
                playerHealthContainer.appendChild(starContainer);
            }
        } else if (starContainer) {
            starContainer.remove();
        }

        // Update cooldowns
        if (this.leftPunchCooldown > 0) this.leftPunchCooldown--;
        if (this.rightPunchCooldown > 0) this.rightPunchCooldown--;
        if (this.highKickCooldown > 0) this.highKickCooldown--;
        if (this.blockCooldown > 0) this.blockCooldown--;

        // Check for round end conditions
        if (this.playerHealth <= 0 || this.opponentHealth <= 0 || this.timeLeft <= 0) {
            this.isGameActive = false;
            this.endRound();
        }
    }

    handleDamage(isPlayerHit, damage) {
        if (isPlayerHit) {
            this.playerHealth = Math.max(0, this.playerHealth - damage);
            const playerHealthBar = document.getElementById('player-health');
            playerHealthBar.classList.add('damage-taken');
            setTimeout(() => playerHealthBar.classList.remove('damage-taken'), 300);
        } else {
            this.opponentHealth = Math.max(0, this.opponentHealth - damage);
            const opponentHealthBar = document.getElementById('opponent-health');
            opponentHealthBar.classList.add('damage-taken');
            setTimeout(() => opponentHealthBar.classList.remove('damage-taken'), 300);
        }
        this.updateGameState();
    }

    endRound() {
        const roundInfo = document.getElementById('round-info');
        if (this.playerHealth <= 0) {
            roundInfo.textContent = `Round ${this.round}: Enemy Wins!`;
            this.opponentWins++;
        } else if (this.opponentHealth <= 0) {
            roundInfo.textContent = `Round ${this.round}: You Win!`;
            this.playerWins++;
        } else {
            roundInfo.textContent = `Round ${this.round}: Time's Up!`;
            if (this.playerHealth > this.opponentHealth) {
                this.playerWins++;
            } else if (this.opponentHealth > this.playerHealth) {
                this.opponentWins++;
            }
        }

        // Check for match end conditions (best of 2 for all levels)
        if (this.playerWins >= 2 || this.opponentWins >= 2) {
            this.isGameActive = false;
            if (this.playerWins > this.opponentWins) {
                roundInfo.textContent = `Level ${this.level} Complete! Press SPACE to continue`;
                if (this.level === 2) {
                    this.level = 3; // Skip directly to level 3
                    this.opponentSpeed = 0.7;
                    this.opponentAttackSpeed = 0.04;
                    this.opponentAttackCooldown = 10;
                    this.spearCooldown = 30;
                    this.opponent.material.color.setHex(0xFFA500); // Orange color for level 3
                } else if (this.level === 1) {
                    this.level = 2;
                    this.opponentSpeed = 0.5;
                    this.opponentAttackSpeed = 0.03;
                    this.opponentAttackCooldown = 15;
                    this.opponent.material.color.setHex(0xFFA500); // Orange color for level 2
                } else if (this.level === 3) {
                    this.level = 4;
                    this.opponentSpeed = 0.8;
                    this.opponentAttackSpeed = 0.05;
                    this.opponentAttackCooldown = 8;
                    this.opponentDamageMultiplier = 1.5;
                    this.opponentBlockCooldown = 5;
                    this.opponent.material.color.setHex(0xFF0000); // Red color for level 4
                }
                window.addEventListener('keydown', this.handleLevelTransition.bind(this));
            } else {
                // For all levels, reset to level 1
                roundInfo.textContent = 'Game Over: Enemy Wins! Press SPACE to restart';
                this.level = 1;
                this.playerWins = 0;
                this.opponentWins = 0;
                this.round = 1;
                this.playerHealth = 100;
                this.opponentHealth = 100;
                this.timeLeft = 60;
                this.isGameActive = true;
                this.opponentSpeed = 0.3;
                this.opponentAttackSpeed = 0.02;
                this.opponentAttackCooldown = 20;
                this.opponentDamageMultiplier = 1;
                this.opponentBlockCooldown = 15;
                this.opponent.material.color.setHex(0xFF0000); // Red color for level 1
                window.addEventListener('keydown', this.handleLevelTransition.bind(this));
            }
        } else {
            setTimeout(() => {
                this.round++;
                this.playerHealth = 100;
                this.opponentHealth = 100;
                this.timeLeft = 60;
                this.isGameActive = true;
                roundInfo.textContent = `Level ${this.level} - Round ${this.round} | Wins: ${this.playerWins}`;
                
                // Reset positions
                this.player.position.set(-2, 0.4, 0);
                this.opponent.position.set(2, 0.4, 0);
                
                // Clear any existing spears
                this.spears.forEach(spear => this.scene.remove(spear.mesh));
                this.spears = [];
            }, 2000);
        }
    }

    handleLevelTransition(event) {
        if (event.key === ' ' && !this.isGameActive) {
            // Remove the event listener
            window.removeEventListener('keydown', this.handleLevelTransition.bind(this));
            
            // Reset game state for new level or restart
            this.playerWins = 0;
            this.opponentWins = 0;
            this.round = 1;
            this.playerHealth = 100;
            this.opponentHealth = 100;
            this.timeLeft = 60;
            this.isGameActive = true;
            
            // Update round info
            const roundInfo = document.getElementById('round-info');
            roundInfo.textContent = `Level ${this.level} - Round ${this.round}`;
            
            // Reset positions
            this.player.position.set(-2, 0.4, 0);
            this.opponent.position.set(2, 0.4, 0);

            // Clear any existing spears
            this.spears.forEach(spear => this.scene.remove(spear.mesh));
            this.spears = [];

            // Set appropriate opponent stats and color for the current level
            if (this.level === 1) {
                this.opponentSpeed = 0.3;
                this.opponentAttackSpeed = 0.02;
                this.opponentAttackCooldown = 20;
                this.opponent.material.color.setHex(0xFF0000); // Red color for level 1
            } else if (this.level === 2) {
                this.opponentSpeed = 0.5;
                this.opponentAttackSpeed = 0.03;
                this.opponentAttackCooldown = 15;
                this.opponent.material.color.setHex(0xFFA500); // Orange color for level 2
            } else if (this.level === 3) {
                this.opponentSpeed = 0.7;
                this.opponentAttackSpeed = 0.04;
                this.opponentAttackCooldown = 10;
                this.spearCooldown = 30;
                this.opponent.material.color.setHex(0xFFA500); // Orange color for level 3
            } else if (this.level === 4) {
                this.opponentSpeed = 0.8;
                this.opponentAttackSpeed = 0.05;
                this.opponentAttackCooldown = 8;
                this.opponentDamageMultiplier = 1.5;
                this.opponentBlockCooldown = 5;
                this.opponent.material.color.setHex(0xFF0000); // Red color for level 4
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isGameActive) {
            this.updateGameState();
            this.updateSpears();

            // Color changing effect for level 3
            if (this.level === 3) {
                const time = Date.now() * 0.001; // Current time in seconds
                const colorValue = Math.sin(time * 2) * 0.5 + 0.5; // Oscillates between 0 and 1
                const yellowColor = new THREE.Color(0xFFFF00); // Yellow
                const whiteColor = new THREE.Color(0xFFFFFF); // White
                this.opponent.material.color.lerpColors(yellowColor, whiteColor, colorValue);
            }

            // Enhanced AI for opponent with level-based speed
            if (Math.random() < this.opponentAttackSpeed) {
                const direction = new THREE.Vector3();
                direction.subVectors(this.player.position, this.opponent.position).normalize();
                this.opponent.position.x += direction.x * this.opponentSpeed;
                this.opponent.position.z += direction.z * this.opponentSpeed;
                
                if (this.opponentAttackCooldown > 0) this.opponentAttackCooldown--;
                if (this.opponentBlockCooldown > 0) this.opponentBlockCooldown--;
                if (this.spearCooldown > 0) this.spearCooldown--;

                const distance = this.player.position.distanceTo(this.opponent.position);
                if (distance < this.attackRange) {
                    // Level 3 specific behavior
                    if (this.level === 3) {
                        // Throw spear if cooldown is ready
                        if (this.spearCooldown <= 0 && Math.random() < 0.3) {
                            this.createSpear();
                            this.spearCooldown = 30;
                        }
                        // More aggressive blocking
                        if (Math.random() < 0.4 && this.opponentBlockCooldown <= 0) {
                            this.opponentIsBlocking = true;
                            this.opponentBlockCooldown = 10;
                            this.opponentBlock();
                        }
                        // Faster attacks
                        if (Math.random() < 0.3 && this.opponentAttackCooldown <= 0) {
                            this.opponentAttackCooldown = this.opponentAttackCooldown;
                            const attackType = Math.random();
                            if (attackType < 0.4) {
                                this.opponentLeftPunch();
                            } else if (attackType < 0.8) {
                                this.opponentRightPunch();
                            } else {
                                this.opponentHighKick();
                            }
                        }
                    } else if (this.level === 4) {
                        // Level 4 specific behavior
                        // Very aggressive blocking
                        if (Math.random() < 0.5 && this.opponentBlockCooldown <= 0) {
                            this.opponentIsBlocking = true;
                            this.opponentBlockCooldown = 5;
                            this.opponentBlock();
                        }
                        // Faster and more frequent attacks
                        if (Math.random() < 0.4 && this.opponentAttackCooldown <= 0) {
                            this.opponentAttackCooldown = this.opponentAttackCooldown;
                            const attackType = Math.random();
                            if (attackType < 0.4) {
                                this.opponentLeftPunch();
                            } else if (attackType < 0.8) {
                                this.opponentRightPunch();
                            } else {
                                this.opponentHighKick();
                            }
                        }
                    } else {
                        // Normal behavior for levels 1-2
                        if (Math.random() < 0.3 && this.opponentBlockCooldown <= 0) {
                            this.opponentIsBlocking = true;
                            this.opponentBlockCooldown = 15;
                            this.opponentBlock();
                        } else if (Math.random() < 0.2 && this.opponentAttackCooldown <= 0) {
                            this.opponentAttackCooldown = this.opponentAttackCooldown;
                            const attackType = Math.random();
                            if (attackType < 0.4) {
                                this.opponentLeftPunch();
                            } else if (attackType < 0.8) {
                                this.opponentRightPunch();
                            } else {
                                this.opponentHighKick();
                            }
                        }
                    }
                }
            }

            if (this.timeLeft > 0) {
                this.timeLeft -= 0.016;
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    opponentLeftPunch() {
        // Animate opponent's left punch
        this.opponentLeftUpperArm.rotation.x = -Math.PI / 2;
        this.opponentLeftElbow.rotation.x = -Math.PI / 2;
        this.opponentLeftHand.rotation.x = -Math.PI / 2;
        
        // Check for hit
        const distance = this.player.position.distanceTo(this.opponent.position);
        if (distance < this.attackRange) {
            if (this.isBlocking) {
                this.playerHealth -= 5;
                this.createHitEffect(this.player.position, 0x00ff00);
            } else {
                this.playerHealth -= 20;
                this.createHitEffect(this.player.position);
            }
        }

        // Reset arm position
        setTimeout(() => {
            this.opponentLeftUpperArm.rotation.x = 0;
            this.opponentLeftElbow.rotation.x = 0;
            this.opponentLeftHand.rotation.x = 0;
        }, 200);
    }

    opponentRightPunch() {
        // Animate opponent's right punch
        this.opponentRightUpperArm.rotation.x = -Math.PI / 2;
        this.opponentRightElbow.rotation.x = -Math.PI / 2;
        this.opponentRightHand.rotation.x = -Math.PI / 2;
        
        // Check for hit
        const distance = this.player.position.distanceTo(this.opponent.position);
        if (distance < this.attackRange) {
            if (this.isBlocking) {
                this.playerHealth -= 5;
                this.createHitEffect(this.player.position, 0x00ff00);
            } else {
                this.playerHealth -= 20;
                this.createHitEffect(this.player.position);
            }
        }

        // Reset arm position
        setTimeout(() => {
            this.opponentRightUpperArm.rotation.x = 0;
            this.opponentRightElbow.rotation.x = 0;
            this.opponentRightHand.rotation.x = 0;
        }, 200);
    }

    opponentHighKick() {
        // Animate opponent's high kick
        this.opponentLeftThigh.rotation.x = -Math.PI / 2;
        this.opponentRightThigh.rotation.x = -Math.PI / 2;
        this.opponentLeftCalf.rotation.x = -Math.PI / 2;
        this.opponentRightCalf.rotation.x = -Math.PI / 2;
        
        // Check for hit
        const distance = this.player.position.distanceTo(this.opponent.position);
        if (distance < this.attackRange) {
            if (this.isBlocking) {
                this.playerHealth -= 5;
                this.createHitEffect(this.player.position, 0x00ff00);
            } else {
                this.playerHealth -= 20;
                this.createHitEffect(this.player.position);
            }
        }

        // Reset leg positions
        setTimeout(() => {
            this.opponentLeftThigh.rotation.x = 0;
            this.opponentRightThigh.rotation.x = 0;
            this.opponentLeftCalf.rotation.x = 0;
            this.opponentRightCalf.rotation.x = 0;
        }, 300);
    }

    opponentBlock() {
        // Animate opponent's blocking stance
        this.opponentLeftUpperArm.rotation.x = -Math.PI / 4;
        this.opponentRightUpperArm.rotation.x = -Math.PI / 4;
        this.opponentLeftForearm.rotation.x = -Math.PI / 4;
        this.opponentRightForearm.rotation.x = -Math.PI / 4;
        
        // Reset arm positions after animation
        setTimeout(() => {
            if (!this.opponentIsBlocking) {
                this.opponentLeftUpperArm.rotation.x = 0;
                this.opponentRightUpperArm.rotation.x = 0;
                this.opponentLeftForearm.rotation.x = 0;
                this.opponentRightForearm.rotation.x = 0;
            }
        }, 200);
    }

    createSpear() {
        const spearMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        
        // Create spear shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
        const shaft = new THREE.Mesh(shaftGeometry, spearMaterial);
        
        // Create spear head
        const headGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
        const head = new THREE.Mesh(headGeometry, spearMaterial);
        head.position.y = 0.6; // Position at top of shaft
        shaft.add(head);
        
        // Position spear at opponent's hand
        shaft.position.copy(this.opponentRightHand.position);
        shaft.position.y += 0.1;
        
        // Calculate direction to player
        const direction = new THREE.Vector3();
        direction.subVectors(this.player.position, shaft.position).normalize();
        
        // Rotate spear to point at player
        shaft.lookAt(this.player.position);
        
        this.scene.add(shaft);
        this.spears.push({
            mesh: shaft,
            direction: direction,
            speed: this.spearSpeed + (this.level - 2) * 0.2 // Faster spears in level 3
        });
    }

    updateSpears() {
        for (let i = this.spears.length - 1; i >= 0; i--) {
            const spear = this.spears[i];
            
            // Move spear
            spear.mesh.position.x += spear.direction.x * spear.speed;
            spear.mesh.position.y += spear.direction.y * spear.speed;
            spear.mesh.position.z += spear.direction.z * spear.speed;
            
            // Check for collision with player
            const distance = spear.mesh.position.distanceTo(this.player.position);
            if (distance < 0.5) {
                if (this.isBlocking) {
                    this.playerHealth -= 5;
                    this.createHitEffect(this.player.position, 0x00ff00);
                } else {
                    this.playerHealth -= 15;
                    this.createHitEffect(this.player.position);
                }
                this.scene.remove(spear.mesh);
                this.spears.splice(i, 1);
            }
            
            // Remove spear if it goes too far
            if (spear.mesh.position.length() > 10) {
                this.scene.remove(spear.mesh);
                this.spears.splice(i, 1);
            }
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new FightingGame();
}); 