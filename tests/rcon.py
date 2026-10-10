import socket,struct,sys
def pkt(s,i,t,b):
    d=struct.pack('<ii',i,t)+b.encode()+b'\0\0'; s.send(struct.pack('<i',len(d))+d)
def rd(s):
    n=struct.unpack('<i',s.recv(4))[0]; d=b''
    while len(d)<n: d+=s.recv(n-len(d))
    return d[8:-2].decode(errors='replace')
port=int(sys.argv[1]); s=socket.create_connection(('127.0.0.1',port)); pkt(s,1,3,'test'); rd(s)
for c in sys.argv[2:]:
    pkt(s,2,2,c); print('>',c,'\n ',rd(s))
