import ShowCard from './ShowCard'
export default function ShowsGrid({ shows, actorsById }){ return (<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>{shows.map(s=> <ShowCard key={s.id} show={s} actorsById={actorsById} />)}</div>) }
