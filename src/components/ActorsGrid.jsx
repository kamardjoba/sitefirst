import ActorCard from './ActorCard'
export default function ActorsGrid({ actors, showsById }){ return (<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>{actors.map(a=> <ActorCard key={a.id} actor={a} showsById={showsById} />)}</div>) }
