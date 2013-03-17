require 'json'
pkg = JSON.parse(File.read(File.expand_path('../package.json', __FILE__)));

task :release => [:lint, :test, :build, :tag]

task :lint do
  abort unless system "grunt jshint"
end

task :test do
  abort unless system "grunt mocha"
end

task :build do
  system "grunt concat"
  system "grunt uglify"
end

task :tag do
  system "git tag -am 'Version #{pkg['version']}' #{pkg['version']}"
  system "git push origin --tags"
end
