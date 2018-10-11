export default function truth(...ops)
{
	let
	i=ops.findIndex(x=>!(x instanceof Function)),
	[pre,state,post]=truth.zipList(ops,i),
	mk=(act,op)=>op(act),
	send=function(act)
	{
		act=pre.reduce(mk,act)
		truth.inject(state,act)
		return new Promise(pass=>pass(post.reduce(mk,act)))
	}//promise prevents holding up subsequent code
	send({type:'set',path:[],val:state})
	return truth.proxy(send,state)
}
truth.inject=function(state,{path,type,val})
{
	if(!type) return
	const
	[props,prop]=truth.zipList(path,path.length-1),
	ref=truth.ref(state,props)
	type==='del'?delete ref[prop]:
	type==='set'&&path.length?ref[prop]=val:
	state=val
}
truth.proxy=function(send,obj,path=[])
{
	return typeof obj==='object'&&obj!==null?
	new Proxy(obj,
	{
		deleteProperty:(obj,prop)=>send({type:'del',path:[...path,prop]}),
		get:(obj,prop)=>truth.proxy(send,obj[prop],[...path,prop]),
		set:(obj,prop,val)=>send({type:'set',path:[...path,prop],val})
	}):obj
}
truth.ref=(ref,path)=>path.reduce((ref,prop)=>ref[prop],ref)
truth.zipList=(x,i)=>[x.slice(0,i),x[i],x.slice(i+1)]