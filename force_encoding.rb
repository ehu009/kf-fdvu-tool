


ARGV.each do |file_name|

  puts file_name
  text = File.read(file_name)
  
  File.open(file_name, "w") do |file|
    file.puts text.encode("iso-8859-1").force_encoding("utf-8")
  end
  
end
