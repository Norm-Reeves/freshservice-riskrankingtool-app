// Executes when the document's ready state changes
document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderMiniViewer();

  // Initialize the Freshworks app
  function renderMiniViewer() {
    console.log('renderMiniViewer function called');
    const onInit = app.initialized();
    onInit
      .then(function getClient(_client) {
        console.log('Freshworks app initialized');
        window.client = _client;

        // Check if the app is running in the mini viewer
        client.instance.context().then(function (context) {
          console.log('App context:', context);
          if (context.location === 'change_sidebar') {
            // Resize only the mini viewer
            client.instance.resize({ height: "300px" });
          }
        });

        // Fetch and update the score on app activation
        client.events.on('app.activated', loadScore);

        // Listen for the score_updated event
        client.events.on('app.event', function (event) {
          console.log('Event received:', event);
          if (event.name === "score_updated") {
            console.log('Score updated event received:', event.payload);
            updateGauge(event.payload.score);  // Use event.payload.score to update the gauge
          }
        });
      })
      .catch(handleErr);
  }
};

async function loadScore() {
  console.log('loadScore function called');
  try {
    const changeId = await getChangeId(); // Retrieve the Change ID
    if (changeId) {
      console.log("Change ID Retrieved Successfully:", changeId);
      // Perform operations with the Change ID
    } else {
      console.error("Failed to retrieve Change ID.");
    }

    const savedValue = await client.db.get(changeId); // Fetch the binary string
    console.log("Fetched saved value:", savedValue); // Log the fetched value

    if (savedValue && typeof savedValue.url === 'string') {
      const score = calculateScoreFromBinary(savedValue.url); // Access the url property
      updateGauge(score); // Update the gauge with the calculated score
      notifyMiniViewer(score); // Notify mini viewer about the updated score
    } else {
      console.error("Failed to retrieve saved value or value is not a string.");
    }
  } catch (error) {
    console.error('Error loading score:', error);
  }
}

function calculateScoreFromBinary(binaryString) {
  console.log('calculateScoreFromBinary function called with binaryString:', binaryString);
  if (typeof binaryString !== 'string') {
    throw new TypeError('binaryString is not a string');
  }

  let score = 0;

  for (let i = 0; i < binaryString.length; i++) {
    // Question 1
    if (i === 0) {
      if (binaryString[i] === '1') {
        score += -10;
      } else if (binaryString[i] === '0') {
        score += 10;
      }
    }

    // Question 2
    if (i === 1) {
      if (binaryString[i] === '1') {
        score += -10;
      } else if (binaryString[i] === '0') {
        score += 10;
      }
    }

    // Question 3
    if (i === 2) {
      if (binaryString[i] === '1') {
        score += -10;
      } else if (binaryString[i] === '0') {
        score += 10;
      }
    }

    // Question 4
    if (i === 3) {
      if (binaryString[i] === '1') {
        score += -10;
      } else if (binaryString[i] === '0') {
        score += 10;
      }
    }

    // Question 5
    if (i === 4) {
      if (binaryString[i] === '1') {
        score += -10;
      } else if (binaryString[i] === '0') {
        score += 10;
      }
    }

    // Question 6
    if (i === 5) {
      if (binaryString[i] === '1') {
        score += -5;
      } else if (binaryString[i] === '0') {
        score += 5;
      }
    }

    // Question 7
    if (i === 6) {
      if (binaryString[i] === '1') {
        score += -10;
      } else if (binaryString[i] === '0') {
        score += 10;
      }
    }

    // Question 8
    if (i === 7) {
      if (binaryString[i] === '1') {
        score += 45;
      } else if (binaryString[i] === '0') {
        score += -45;
      }
    }

    // Question 9
    if (i === 8) {
      if (binaryString[i] === '1') {
        score += 45;
      } else if (binaryString[i] === '0') {
        score += -45;
      }
    }

    // Question 10
    if (i === 9) {
      if (binaryString[i] === '1') {
        score += 45;
      } else if (binaryString[i] === '0') {
        score += -45;
      }
    }
  }

  console.log('Calculated Score from Binary:', score);
  return score;
}

// Local object to track answers
const currentAnswers = {};

// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOMContentLoaded event triggered');
  updateGauge(0); // Initialize gauge with a default score of 0

  const questions = document.querySelectorAll("#ranking-tool-table input[type='radio']");
  questions.forEach((input) => {
    input.addEventListener("change", (event) => {
      console.log('Radio input changed:', event.target.name, event.target.value);
      // Update the local answers object on selection
      currentAnswers[event.target.name] = event.target.value === "yes" ? "1" : "0";
    });
  });

  // Add event listener for the "Save" button
  document.getElementById("save-button").addEventListener("click", async () => {
    console.log('Save button clicked');
    const changeId = await getChangeId();
    if (changeId) { 
      saveAnswers(changeId);
    }
  });
});

// Launches the risk ranking tool in a modal
function launchTool() {
  console.log('launchTool function called');
  client.interface.trigger('showModal', {
    title: 'Risk Ranking Tool',
    template: 'index.html',
    data: {
      modalSize: 'large'
    }
  }).then(function () {
    client.instance.on('app.modal.closed', function () {
      console.log('Modal closed event received');
  
      // Ensure the score is calculated before sending the event
      const score = calculateScore(); // Ensure the score is calculated before sending the event
  
      // Send the score update event
      client.instance.send({
        name: "score_updated",
        payload: { score: score }
      }).then(() => {
        console.log("score_updated event sent");
  
        // Force a refresh of the mini-viewer by triggering app.activated
        client.events.emit('app.activated');
  
        // Optionally resize mini-viewer if necessary to trigger a re-render
        client.instance.resize({ height: '300px' }).then(() => {
          console.log('Mini-viewer resized after modal closed');
        }).catch((error) => {
          console.error('Error resizing mini-viewer:', error);
        });
      }).catch((error) => {
        console.error("Error sending score_updated event:", error);
      });
    });
  }).catch((err) => {
    console.error("Error showing modal:", err);
  });
}

// Calculates the total score based on selected radio inputs
function calculateScore() {
  console.log('calculateScore function called');
  let score = 0;

  // Get all checked radio inputs within the form
  const responses = document.querySelectorAll('#ranking-tool-table input[type="radio"]:checked');
  responses.forEach(input => {
    const value = input.value;
    const scoreYes = parseInt(input.dataset.scoreYes, 10); // Data attribute for "Yes" score
    const scoreNo = parseInt(input.dataset.scoreNo, 10); // Data attribute for "No" score

    if (value === 'yes') {
      score += scoreYes;
    } else if (value === 'no') {
      score += scoreNo;
    }
  });
  
  console.log('Calculated Score:', score);
  updateGauge(score); // Update the gauge with the calculated score

  return score;  // Return the calculated score
}

// Updates the gauge visualization and risk level based on the score
function updateGauge(score) {
  console.log('updateGauge function called with score:', score);
  
  const needle = document.querySelector('.gauge-needle');
  const valueLabel = document.getElementById('gauge-value');
  const riskLabel = document.getElementById('risk-level');
  const riskContainer = document.getElementById('risk-level-container');

  const minValue = -200; // Minimum value for the gauge
  const maxValue = 200; // Maximum value for the gauge
  const range = maxValue - minValue;
  const percentage = ((score - minValue) / range) * 100;
  const angle = (percentage / 100) * 180;

  needle.style.transform = `rotate(${angle - 90}deg)`; // Adjust by -90 degrees to start from the left
  valueLabel.textContent = score; // Display the score

  if (score <= -10) {
    riskLabel.textContent = 'Low Risk';
    riskContainer.className = 'low-risk risk-ranking';
  } else if (score <= 49) {
    riskLabel.textContent = 'Medium Risk';
    riskContainer.className = 'medium-risk risk-ranking';
  } else {
    riskLabel.textContent = 'High Risk';
    riskContainer.className = 'high-risk risk-ranking';
  }
}

// Saves the answers as a binary string for the current change
function saveAnswers(changeId) {
  console.log("saveAnswers function called with changeId:", changeId);

  const questions = document.querySelectorAll("#ranking-tool-table input[type='radio']");
  const questionNames = new Set(); // Track unique question names

  questions.forEach((input) => {
    questionNames.add(input.name); // Collect unique question names
  });

  // Check if all questions are answered
  if (Object.keys(currentAnswers).length !== questionNames.size) {
    showMessage("Error: Please select an option for all questions", "error");
    return;
  }

  // Join answers into a binary string
  const binaryString = Object.values(currentAnswers).join("");
  console.log("Binary String:", binaryString);

  // Ensure changeId and binaryString are defined before calling toString
  if (changeId && binaryString) {
    let key = changeId.toString();
    let value = binaryString.toString();
    console.log("Saving key:", key, "with value:", value); // Log the key and value being saved

    client.db.set(key, { 'url': value }).then(function(data) {
      console.log("Data saved:", data);
      showMessage('Answers saved successfully', 'success');

      // Explicitly calculate the score and log it
      const calculatedScore = calculateScore();  // Call this function directly and capture the result
      console.log("Calculated Score before sending:", calculatedScore);

      // If calculatedScore is undefined, set a fallback value
      if (calculatedScore === undefined) {
        console.error("Error: calculatedScore is undefined.");
        return;  // Don't send the event if the score is invalid
      }

      // Prepare payload and log it
      const payload = { 
        score: calculatedScore,
        changeId: changeId  // Include changeId if required
      };
      console.log("Payload being sent:", payload);

      // Trigger the score_updated event
      client.interface.trigger("app.event", {
        name: "score_updated",
        payload: payload
      }).then(() => {
        console.log("score_updated event sent successfully");
      }).catch((err) => {
        console.error("Error sending score_updated event:", err);
      });

      client.instance.close(); // Close the modal
    }, function (error) {
      console.error("Error saving data:", error);
    });

  } else {
    console.error("changeId or binaryString is undefined.");
  }
}


// Displays success or error messages to the user
function showMessage(message, type) {
  const saveMessage = document.getElementById('save-message');
  saveMessage.textContent = message;

  if (type === 'success') {
    saveMessage.style.color = 'green';
  } else if (type === 'error') {
    saveMessage.style.color = 'red';
  }

  saveMessage.style.display = 'block';
}

// Loads previously saved answers for the current change
async function loadSavedAnswers(changeId) {  
  console.log('loadSavedAnswers function called with changeId:', changeId);
  try {
    let data = await client.db.get(`${changeId}`);
    if (data) {
      console.log("Success:", data);
      return data;
    } else {
      console.error("No data found for the given Change ID.");
    }
  } catch (error) {
    console.error("Error loading saved answers:", error);
  }
  calculateScore(); // Recalculate the score after loading saved answers
}

// Retrieves the unique Change ID from Freshservice
function getChangeId() {
  console.log('getChangeId function called');
  return client.data.get("change").then(
    function (data) {
      const changeId = data.change.id;
      console.log("Successful. Change ID:", changeId);
      return changeId; // Return the Change ID
    },
    function (error) {
      console.error("Failed to retrieve Change ID.", error);
      throw error; // Propagate the error to the caller
    }
  );
}

// Notify mini viewer about the updated score
function notifyMiniViewer(score) {
  console.log('notifyMiniViewer function called with score:', score);
  client.interface.trigger("app.event", {
    name: "score_updated",
    payload: { score: score },
  });
}

// Update relevant change fields
async function updateTicketField(changeId, score) {
  const apiKey = 'YOUR_FRESHSERVICE_API_KEY'; // Replace with your Freshservice API Key
  const domain = 'yourdomain'; // Replace with your Freshservice domain (e.g., 'yourcompany.freshservice.com')

  const url = `https://${domain}.freshservice.com/api/v2/changes/${changeId}`;

  const payload = {
    change: {
      custom_fields: {
        cf_risk_ranking: score // Update with the actual custom field ID and the score value
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Basic ' + btoa(apiKey + ':X'), // Authentication header with API key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Error updating change ticket: ' + response.statusText);
    }

    const responseData = await response.json();
    console.log('Risk Ranking updated successfully:', responseData);
  } catch (error) {
    console.error('Error:', error);
  }
}