Step 1: Update System

  sudo apt update && sudo apt upgrade -y

  Step 2: Install Node.js 18

  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs

  Step 3: Install Chrome (for WhatsApp Web)

  wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
  echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
  sudo apt update
  sudo apt install -y google-chrome-stable

  Step 4: Install Git and PM2

  sudo apt install -y git
  sudo npm install -g pm2

  Step 5: Verify Everything Installed

  node --version    # Should show v18.x.x
  npm --version     # Should show 9.x.x
  google-chrome --version  # Should show Chrome version
  pm2 --version     # Should show PM2 version

  Step 6: Clone Your Bot

  git clone https://github.com/AaronMathew11/BirthDayBot.git
  cd BirthDayBot

  Step 7: Install Dependencies and Start

  npm install
  pm2 start src/index.js --name birthday-bot
  pm2 logs birthday-bot
