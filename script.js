// Flowchart data
const timelineData = [
    { id: 'start', label: 'START', description: 'Beginning of the supply chain process' },
    { id: 'productRegistration', label: 'Product Registration', description: 'Register the product in the blockchain network' },
    { id: 'createShippingRequest', label: 'Create Shipping Request', description: 'Initiate a shipping request for the registered product' },
    { id: 'carrierBidding', label: 'Carrier Bidding', description: 'Carriers place bids on the shipping request' },
    { id: 'selectCarrier', label: 'Select Carrier', description: 'Choose the most suitable carrier based on bids' },
    { id: 'createSmartContract', label: 'Create Smart Contract', description: 'Generate a smart contract for the shipping agreement' },
    { id: 'attachIotDevices', label: 'Attach IOT Devices', description: 'Connect IoT devices to the shipment for tracking' },
    { id: 'beginShipment', label: 'Begin Shipment', description: 'Start the shipping process with real-time tracking' },
    { id: 'confirmDelivery', label: 'Confirm Delivery', description: 'Verify the successful delivery of the shipment' },
    { id: 'end', label: 'END', description: 'Completion of the supply chain process' }
];

const timelineContainer = document.querySelector('.timeline-container');

// Create timeline nodes
timelineData.forEach((item, index) => {
    const node = document.createElement('div');
    node.classList.add('timeline-node');
    node.id = item.id;
    node.innerHTML = `<h3>${item.label}</h3\><p>${item.description}</p>`;
    timelineContainer.appendChild(node);
});

// Create timeline line
const timelineLine = document.createElement('div');
timelineLine.classList.add('timeline-line');
timelineContainer.appendChild(timelineLine);

// Animation (using GSAP)
gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('.timeline-node').forEach((node, index) => {
    gsap.to(node, {
        opacity: 1,
        duration: 0.5,
        scrollTrigger: {
            trigger: node,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });
});

// Smart Contract Interaction

let web3;
let contract;
let reputationContract;
let account;

// Illustrative contract addresses and ABIs (replace with your actual ones)
const contractAddress = "0x4F9d92313B998AC177CF742E71732AB9505BfFb5"; 
const abi = [
    {
        "inputs": [],
        "name": "depositAdvancePayment",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "confirmDelivery",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "releasePaymentToSupplier",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "refundCustomer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
    // ... add other ABI entries as needed
];

const reputationContractAddress = "0x4F9d92313B998AC177CF742E71732AB9505BfFb5";
const reputationABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "_transactionId", "type": "string" },
            { "internalType": "uint8", "name": "_rating", "type": "uint8" },
            { "internalType": "string", "name": "_review", "type": "string" }
        ],
        "name": "rateTransaction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_address", "type": "address" }
        ],
        "name": "getReputation",
        "outputs": [
            { "internalType": "uint256", "name": "_averageRating", "type": "uint256" },
            { "internalType": "uint256", "name": "_totalRatings", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Connect to MetaMask
async function connectWallet() {
    console.log("Connect wallet function called");

    if (typeof window.ethereum !== 'undefined') {
        console.log("MetaMask is installed");

        if (window.ethereum.isMetaMask) {
            console.log("Confirmed it's MetaMask");
            web3 = new Web3(window.ethereum);
            try {
                console.log("Requesting account access");
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();  

                account = accounts[0];
                console.log("Connected account:", account);

                document.getElementById('account').innerText = account;
                document.getElementById('connected-account').innerText = account;

                // Initialize contract instances
                contract = new web3.eth.Contract(abi, contractAddress);
                reputationContract = new web3.eth.Contract(reputationABI, reputationContractAddress);

                // Update UI to show connected status
                updateWalletStatusElements("Connected: " + account);

            } catch (error) {
                console.error("Error connecting to MetaMask:", error);
                alert("Error connecting to MetaMask. Check console for details.");
            }
        } else {
            console.log("Ethereum object is not MetaMask");
            alert("Please use MetaMask!");
        }
    } else {
        console.log("Ethereum object not found");
        alert("Please install MetaMask!");
    }
}
function updateWalletStatusElements(message) {
    const walletStatusIds = ['wallet-status', 'wallet-status-smart-contracts', 'wallet-status-supply-chain'];
    walletStatusIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = message;
      }
    });
  }
// Deposit advance payment
async function depositAdvance() {
    if (!checkWalletConnection()) return;

    const amount = document.getElementById("depositAmount").value;
    const weiAmount = web3.utils.toWei(amount, 'ether');
    try {
        await contract.methods.depositAdvancePayment().send({
            from: account,
            value: weiAmount
        });
        alert("Advance payment deposited successfully!");
    } catch (error) {
        console.error("Error depositing advance payment:", error);
        alert("An error occurred. Please check the console for details.");
    }
}

// Confirm delivery (only supplier can call this)
async function confirmDelivery() {
    if (!checkWalletConnection()) return;

    try {
        await contract.methods.confirmDelivery().send({ from: account });
        alert("Delivery confirmed!");
    } catch (error) {
        console.error("Error confirming delivery:", error);
        alert("An error occurred. Make sure you're the supplier.");
    }
}

// Release payment to supplier (only customer can call this)
async function releasePayment() {
    if (!checkWalletConnection()) return;

    try {
        await contract.methods.releasePaymentToSupplier().send({ from: account });
        alert("Payment released to supplier!");
    } catch (error) {
        console.error("Error releasing payment:", error);
        alert("An error occurred. Make sure you're the customer.");
    }
}

// Refund customer if no delivery (only customer can call this)
async function refundCustomer() {
    if (!checkWalletConnection()) return;

    try {
        await contract.methods.refundCustomer().send({ from: account });
        alert("Refund processed!");
    } catch (error) {
        console.error("Error processing refund:", error);
        alert("An error occurred. Make sure you're the customer and the conditions for a refund are met.");
    }
}

// Simulated blockchain state & functions for marketplace, supply chain, and reputation system

// Marketplace
let jobs = [];
let connectedAccount = null;

function checkWalletConnection() {
    if (!account) {
        console.log("No wallet connected");
        updateWalletStatusElements("Wallet not connected");
        return false;
    }
    console.log("Wallet connected:", account);
    updateWalletStatusElements("Wallet connected: " + account); 
    return true;
}

function postJob() {
    // 1. Check if the user's wallet is connected
    if (!checkWalletConnection()) return; 

    // 2. Get job details from the input fields
    const description = document.getElementById('job-description').value;
    const price = document.getElementById('job-price').value;

    // 3. Validate the input
    if (description && price) {
        // 4. Create a new job object
        const newJob = { 
            id: jobs.length, // Assign a unique ID
            description, 
            price, 
            shipper: account, // Use the connected account's address
            status: 'available' 
        };

        // 5. Add the new job to the jobs array (simulated blockchain)
        jobs.push(newJob);

        // 6. Update the job list display on the page
        updateJobList();

        // 7. Create a transaction for the new job (for the reputation system)
        const transactionId = `job-${newJob.id}`;
        transactions.push({
            id: transactionId,
            address: account, 
            type: 'post_job'
        });

        // 8. Update the transaction select dropdown in the reputation system
        updateTransactionSelect();

        // 9. Log the posted job to the console and display a success message
        console.log("Job posted:", newJob);
        alert("Job posted successfully!");
    } else {
        // 10. Display an error message if the input is invalid
        alert("Please fill in all fields!");
    }
}

// Update the job list display
function updateJobList() {
    const jobList = document.getElementById('job-list');
    jobList.innerHTML = ''; // Clear the existing list
    jobs.forEach(job => {
        // Only show jobs that are not posted by the current user and are available
       // if (job.shipper !== account && job.status === 'available') { 
        const jobElement = document.createElement('div');
        jobElement.className = 'job-item';
    
        // Use string concatenation to build the HTML content
        let htmlContent = '<p><strong>Description:</strong> ' + job.description + '</p>';
        htmlContent += '<p><strong>Price:</strong> ' + job.price + ' ETH</p>';
        htmlContent += '<p><strong>Shipper:</strong> ' + job.shipper + '</p>';
        htmlContent += '<button onclick="acceptJob(' + job.id + ')">Accept Job</button>';
    
        jobElement.innerHTML = htmlContent;
        jobList.appendChild(jobElement);
      });
    }  


// Accept a job
function acceptJob(jobId) {
    if (!checkWalletConnection()) return;

    const job = jobs.find(j => j.id === jobId);
    if (job) {
        console.log(`Job ${jobId} accepted by ${account}`); 
        alert(`You've accepted the job: ${job.description}`);

        // Create a transaction for the accepted job (illustrative)
        const transactionId = `accept-${jobId}`;
        transactions.push({
            id: transactionId,
            address: account, 
            type: 'accept_job'
        });
        updateTransactionSelect();
    }
}

// Initialize the marketplace
function initMarketplace() {
    connectWallet();
    updateJobList();
}

// Simulated blockchain state for supply chain
let shipments = [];

// Smart Contract ABI (simplified for this example)
const supplyChainABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "_shipmentId", "type": "string"},
            {"internalType": "string", "name": "_origin", "type": "string"},
            {"internalType": "string", "name": "_destination", "type": "string"}
        ],
        "name": "createShipment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_shipmentId", "type": "string"},
            {"internalType": "string", "name": "_status", "type": "string"},
            {"internalType": "string", "name": "_location", "type": "string"}
        ],
        "name": "updateShipmentStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_shipmentId", "type": "string"}
        ],
        "name": "getShipmentUpdates",
        "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Create a new shipment
function createShipment() {
    const shipmentId = document.getElementById('shipment-id').value;
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;

    if (shipmentId && origin && destination) {
        const newShipment = { 
            id: shipmentId, 
            origin, 
            destination, 
            updates: [{
                status: 'Created',
                location: origin,
                timestamp: new Date().toISOString()
            }]
        };
        shipments.push(newShipment);
        updateShipmentSelects();
        // In a real implementation, you would call the smart contract here
        console.log("Shipment created:", newShipment);
    } else {
        alert("Please fill in all fields!");
    }
}

// Update shipment status
function updateShipmentStatus() {
    const shipmentId = document.getElementById('shipment-select').value;
    const status = document.getElementById('status-select').value;
    const location = document.getElementById('location').value;

    if (shipmentId && status && location) {
        const shipment = shipments.find(s => s.id === shipmentId);
        if (shipment) {
            shipment.updates.push({
                status,
                location,
                timestamp: new Date().toISOString()
            });
            // In a real implementation, you would call the smart contract here
            console.log(`Shipment ${shipmentId} updated:`, shipment);
        }
    } else {
        alert("Please fill in all fields!");
    }
}

// Track shipment
function trackShipment() {
    const shipmentId = document.getElementById('track-shipment-select').value;
    const statusDiv = document.getElementById('shipment-status');
    statusDiv.innerHTML = '';

    const shipment = shipments.find(s => s.id === shipmentId);
    if (shipment) {
        statusDiv.innerHTML = `<h4>Shipment ${shipmentId}</h4>`;
        statusDiv.innerHTML += `<p><strong>Origin:</strong> ${shipment.origin}</p>`;
        statusDiv.innerHTML += `<p><strong>Destination:</strong> ${shipment.destination}</p>`;
        statusDiv.innerHTML += '<h4>Status Updates:</h4>';
        shipment.updates.forEach(update => {
            statusDiv.innerHTML += `
                <div class="status-update">
                    <p><strong>Status:</strong> ${update.status}</p>
                    <p><strong>Location:</strong> ${update.location}</p>
                    <p><strong>Timestamp:</strong> ${update.timestamp}</p>
                </div>
            `;
        });
    } else {
        statusDiv.innerHTML = '<p>Shipment not found.</p>';
    }
}

// Update shipment select dropdowns
function updateShipmentSelects() {
    const selects = ['shipment-select', 'track-shipment-select'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select a shipment</option>';
        shipments.forEach(shipment => {
            const option = document.createElement('option');
            option.value = shipment.id;
            option.textContent = shipment.id;
            select.appendChild(option);
        });
    });
}

// Initialize the supply chain tracking system
function initSupplyChainTracking() {
    updateShipmentSelects();
}

// Simulated blockchain state for reputation system
let transactions = []; 
let reputations = {};

// Submit a rating for a transaction
function submitRating() {
    if (!checkWalletConnection()) return; 

    const transactionId = document.getElementById('transaction-select').value;
    const rating = document.getElementById('rating-select').value;
    const review = document.getElementById('review-text').value;

    if (transactionId && rating) {
        // In a real implementation, you would call the reputationContract here
        console.log(`Rating submitted for transaction ${transactionId}: ${rating} stars`);

        // Update the reputation in our simulated blockchain
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction) {
            if (!reputations[transaction.address]) {
                reputations[transaction.address] = { totalRating: 0, count: 0 };
            }
            reputations[transaction.address].totalRating += parseInt(rating);
            reputations[transaction.address].count += 1;

            // Add the rating to the transaction
            transaction.rating = {
                rating: parseInt(rating),
                review: review,
                rater: connectedAccount
            };

            alert("Rating submitted successfully!");
            updateTransactionSelect(); 
        }
    } else {
        alert("Please select a transaction and rating!");
    }
}

// View reputation for an address
function viewReputation() {
    const address = document.getElementById('address-input').value;
    const reputationDisplay = document.getElementById('reputation-display');

    if (address && reputations[address]) {
        const averageRating = reputations[address].totalRating / reputations[address].count;
        const totalRatings = reputations[address].count;

        reputationDisplay.innerHTML = `
            <h4>Reputation for ${address}</h4>
            <p><strong>Average Rating:</strong> ${averageRating.toFixed(2)} stars</p>
            <p><strong>Total Ratings:</strong> ${totalRatings}</p>
            <h4>Recent Ratings:</h4>
        `;

        // Display recent ratings
        const recentRatings = transactions
            .filter(t => t.address === address && t.rating)
            .slice(0, 5); 

        recentRatings.forEach(t => {
            reputationDisplay.innerHTML += `
                <div class="rating-item">
                    <p><strong>Transaction:</strong> ${t.id}</p>
                    <p><strong>Rating:</strong> <span class="star-rating">${'★'.repeat(t.rating.rating)}${'☆'.repeat(5 - t.rating.rating)}</span></p>
                    <p><strong>Review:</strong> ${t.rating.review || 'No review provided'}</p>
                </div>
            `;
        });
    } else {
        reputationDisplay.innerHTML = '<p>No reputation data found for this address.</p>';
    }
}

// Update transaction select dropdown
function updateTransactionSelect() {
    const select = document.getElementById('transaction-select');
    select.innerHTML = '<option value="">Select a transaction</option>';
    transactions.forEach(transaction => {
        if (!transaction.rating) { 
            const option = document.createElement('option');
            option.value = transaction.id;
            option.textContent = `${transaction.id} (${transaction.address})`;
            select.appendChild(option);
        }
    });
}

// Initialize the reputation system
function initReputationSystem() {
    updateTransactionSelect();
}

// Call init functions when the page loads
window.addEventListener('load', () => {
    console.log("Initializing page");
    initMarketplace();
    initSupplyChainTracking();
    initReputationSystem();
});