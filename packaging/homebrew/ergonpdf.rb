cask "ergonpdf" do
  version "1.2.0"
  sha256 "a0e198e4d7078d131cca6a9f05de58bb1be741d21f10cb1a35928c49aeffb510"

  url "https://github.com/CodeSorcerer-007/ErgonPDF/releases/download/v#{version}/ErgonPDF-v#{version}-Windows-Setup.zip"
  name "ErgonPDF"
  desc "Privacy-first all-in-one local PDF workspace and document engine"
  homepage "https://github.com/CodeSorcerer-007/ErgonPDF"

  livecheck do
    url :url
    strategy :github_latest
  end

  auto_updates true

  app "ErgonPDF"

  zap trash: [
    "~/.ergonpdf",
    "~/Library/Application Support/ErgonPDF",
    "~/Library/Preferences/com.ergonpdf.app.plist",
  ]
end
