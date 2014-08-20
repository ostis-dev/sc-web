import os, sys, json

root_dir = "../client/components/"

def print_error(s):
    print "[Error] %s" % s

def concatenate_files(work_dir, file_list):
    
    res = ''
    for f in file_list:
        path = os.path.join(work_dir, f)
        if not os.path.isfile(path):
            print "Can't find file %s" % path
            return None
        
        f = open(path, 'r')
        res += f.read()
        res += '\n\n\n'
        f.close()
        
    return res

for cmp_dir in os.listdir(root_dir):
    work_dir = os.path.join(root_dir, cmp_dir)
    if not os.path.isdir(work_dir):
        continue
        
    rules_path = os.path.join(work_dir, "rules.json")
    print "Process ", rules_path
    rules = json.load(open(rules_path))
    
    # prepare html base on template
    template = os.path.join(work_dir, rules['template'])
    if not os.path.isfile(template):
        print_error("Template %s doesn't exists" % template)
        continue
        
    css = concatenate_files(work_dir, rules['styles'])
        
    js = concatenate_files(work_dir, rules['scripts'])
        
    f = open(template, 'r')
    source = f.read()
    f.close()
    
    result = ''
    if len(css) > 0:
        result = source.replace('<!--style-->', css)
        
        if len(result) == len(source):
            print_error("Can't insert styles")
            sys.exit(0)
            
        source = result
            
    if len(js) > 0:
        result = source.replace('<!--script-->', js)
        
        if len(result) == len(source):
            print_error("Can't insert script")
            sys.exit(0)
        
    
    # output file
    output = os.path.join(work_dir, rules['output'])
    print "Write output file %s" % output
    f = open(output, 'w')
    f.write(result)
    f.close()
