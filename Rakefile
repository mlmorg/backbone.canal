require 'json'
pkg = JSON.parse(File.read(File.expand_path('../package.json', __FILE__)));

task :release => [:lint, :test, :build, :push, :tag]

task :lint do
  abort unless system "grunt jshint"
end

task :test do
  abort unless system "grunt mocha"
end

task :build do
  abort unless system "grunt concat"
end

task :push do
  system "git push origin HEAD:stable"
end

task :tag do
  system "git tag -am 'Version #{pkg['version']}' #{pkg['version']}"
  system "git push origin --tags"
end
