import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// AI Thinking function
function loader (element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }

  }, 300)
}

// AI is Answering function
function typingText (element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index ++;

    }else {
      clearInterval (interval);
    }
  }, 50);
}

// generate Unique ID for Each Question
function generateUniqueId () {
  const timestamp = Date.now ();
  const randomNumber = Math.random ();
  const haxdecimalString = randomNumber.toString (16);
  return `id-${timestamp}-${haxdecimalString}`;
}

// ChatStript
function chatStript (isAi, Value, uniqueId) {
  return `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user }" alt="${isAi ? 'bot' : 'user' }">
        </div>
        
        <div class="message" id="${uniqueId}">${Value}</div>
      </div>
    </div>
  `;
}

// handle submit (our trigger to handle the chart)
const handleSubmit = async (e) => {
  e.preventDefault ();

  const data = new FormData (form);

  let EMPTYFIELD = (data.get ('prompt') === "") ? true : false;
  
  // user's chatsprite
  chatContainer.innerHTML += chatStript (false, data.get ('prompt'));

  // clear the text Area Input 
  form.reset ()

  // bot's chatsprite
  const uniqueId = generateUniqueId ();

  chatContainer.innerHTML += chatStript (true, "", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById (uniqueId);

  loader (messageDiv);

  // fetch data from server
  const response = await fetch ('https://nad-codegpt.onrender.com/', {
    method: "POST",
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify ({
      prompt: data.get ('prompt')
    })
  })

  clearInterval (loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json ();
    const parsedData = data.bot.trim ();

    typingText (messageDiv, parsedData);
  }else {
    const err = await response.text ();

    // messageDiv.innerHTML = "Apologies i was unable to resolve Your Question!";
    if (!EMPTYFIELD) {
      typingText (messageDiv, "Apologies I was unable to resolve Your Question!");
      document.getElementById("errors").innerHTML = "SomeThing Went Wrong!";
      document.getElementById("errors").classList.add ("active");
    }else{
      typingText (messageDiv, "Please Prove Me With A Question You Need Help With!");
      document.getElementById("errors").innerHTML = "Empty Question Field!";
      document.getElementById("errors").classList.add ("active");
    }
    setTimeout (() => {
      document.getElementById("errors").classList.remove ("active");
    }, 5000);
    
  }

}

form.addEventListener ('submit', handleSubmit);
form.addEventListener ('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit (e);
  }
});


