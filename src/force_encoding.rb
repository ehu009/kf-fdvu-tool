


ARGV.each do |file_name|
  text = File.read(file_name)
  
  new_name = String.new(file_name)
  new_name[".csv"] = " - korrigert.csv"
  File.open(new_name, "w") do |file|
    unless text.valid_encoding? then
      text.scrub
    else
      text = text.encode("iso-8859-1").force_encoding("utf-8")
    end
    file.puts text
  end
  
end
