const diseases = [
    {
        name: "Простуда",
        symptoms: ["кашель", "насморк", "температура", "боль в горле"],
        description: "Простуда часто сопровождается кашлем, насморком, температурой и болью в горле."
    },
    {
        name: "Анемия",
        symptoms: ["слабость", "головокружение", "бледность", "усталость"],
        description: "Анемия может проявляться слабостью, бледностью, усталостью и головокружением."
    },
    {
        name: "Мигрень",
        symptoms: ["головная боль", "тошнота", "чувствительность к свету"],
        description: "Мигрень часто вызывает сильную головную боль, тошноту и чувствительность к свету."
    },
    {
        name: "Аллергия",
        symptoms: ["насморк", "чихание", "зуд", "слезотечение"],
        description: "Аллергия может проявляться чиханием, зудом, насморком и слезотечением."
    },
    {
        name: "Пищевое отравление",
        symptoms: ["тошнота", "рвота", "боль в животе", "слабость"],
        description: "Пищевое отравление часто сопровождается тошнотой, рвотой, болью в животе и слабостью."
    }
];

const symptomsContainer = document.getElementById("symptomsContainer");
const resultText = document.getElementById("resultText");
const descriptionText = document.getElementById("descriptionText");
const checkButton = document.getElementById("checkButton");
const resetButton = document.getElementById("resetButton");

let selectedSymptoms = [];

function getAllSymptoms() {
    const allSymptoms = [];

    for (let i = 0; i < diseases.length; i++) {
        for (let j = 0; j < diseases[i].symptoms.length; j++) {
            const symptom = diseases[i].symptoms[j];

            if (!allSymptoms.includes(symptom)) {
                allSymptoms.push(symptom);
            }
        }
    }

    return allSymptoms;   
}

function createSymptomButtons() {
    const symptoms = getAllSymptoms();

    for (let i = 0; i < symptoms.length; i++) {
        const button = document.createElement("button");

        button.textContent = symptoms[i];
        button.className = "symptom-button";

        button.addEventListener("click", function () {
            toggleSymptom(symptoms[i], button);
        });

        symptomsContainer.appendChild(button);
    }
}

function toggleSymptom(symptom, button) {
    if (selectedSymptoms.includes(symptom)) {
        selectedSymptoms = selectedSymptoms.filter(function (item) {
            return item !== symptom;
        });

        button.classList.remove("active");
    } else {
        selectedSymptoms.push(symptom);
        button.classList.add("active");
    }
}

function checkDiagnosis() {
    if (selectedSymptoms.length === 0) {
        resultText.textContent = "Выберите хотя бы один симптом.";
        descriptionText.textContent = "";
        return;
    }

    let bestDisease = null;
    let bestMatches = 0;

    for (let i = 0; i < diseases.length; i++) {
        let matches = 0;

        for (let j = 0; j < selectedSymptoms.length; j++) {
            if (diseases[i].symptoms.includes(selectedSymptoms[j])) {
                matches++;
            }
        }

        if (matches > bestMatches) {
            bestMatches = matches;
            bestDisease = diseases[i];
        }
    }

    const percent = Math.round((bestMatches / bestDisease.symptoms.length) * 100);

    resultText.textContent = "Возможный вариант: " + bestDisease.name + " — совпадение " + percent + "%";
}

function resetQuiz() {
    selectedSymptoms = [];

    const buttons = document.querySelectorAll(".symptom-button");

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    resultText.textContent = "Пока симптомы не выбраны";
    descriptionText.textContent = "";
}

checkButton.addEventListener("click", checkDiagnosis);
resetButton.addEventListener("click", resetQuiz);

createSymptomButtons();