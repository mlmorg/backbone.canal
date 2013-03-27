require 'json'
pkg = JSON.parse(File.read(File.expand_path('../package.json', __FILE__)));

task :release => [:build, :push, :tag]

task :build do
  abort unless system "grunt"
end

task :push do
  system "git push origin HEAD:stable"
end

task :tag do
  system "git tag -am 'Version #{pkg['version']}' #{pkg['version']}"
  system "git push origin --tags"
end
