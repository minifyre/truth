export const
compose=(fns,arg)=>fns.reduce((arg,fn)=>fn(arg),arg),
mkProxy=function(send,obj,path=[])
{
	return typeof obj==='object'&&obj!==null?
	new Proxy(obj,
	{
		deleteProperty:(obj,prop)=>send({type:'del',path:[...path,prop]}),
		get:(obj,prop)=>mkProxy(send,obj[prop],[...path,prop]),
		set:(obj,prop,value)=>send({type:'set',path:[...path,prop],value})
	}):obj
},
pointer=(ref,path)=>path.reduce((ref,prop)=>ref[prop],ref),
zipList=(x,i)=>[x.slice(0,i),x[i],x.slice(i+1)]