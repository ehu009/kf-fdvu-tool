


ARGV.each do |file_name|

  puts file_name
  
  text = File.read(file_name)
  .gsub(/Ã†/, 'Æ')
  .gsub(/Ã˜/, 'Ø')
  .gsub(/Ã…/, 'Å')
  .gsub(/Ã¦/, 'æ')
  .gsub(/Ã¸/, 'ø')
  .gsub(/Ã¥/, 'å')
  .encode("iso-8859-1").force_encoding("utf-8")
  
  File.open(file_name, "w") do |file|
    file.puts text
  end
  
end
