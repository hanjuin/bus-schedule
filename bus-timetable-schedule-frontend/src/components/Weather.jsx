import { useEffect } from "react";

function Weather({ weatherData }) {
    useEffect(() => {
        if (weatherData) {
        console.log("Weather data updated:", weatherData);
        }
    }, [weatherData]);

    if (!weatherData || !weatherData.forecast || !weatherData.forecast.forecastday) {
        return <div className="text-gray-500">Loading weather data...</div>;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md text-black flex flex-col lg:flex-row gap-4">
            {/* <div className='basic:1/4'>
                {weatherData.current.temp_c}
            </div> */}
            {weatherData.forecast.forecastday.map((day, index) => (
                
                <div key={index} className='basis-1/3 text-right flex flex-col items-end'>
                    <img src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} style={{ width: '32px', height: '32px' }} className='ml-auto'/>
                    <h3 className="font-semibold">{new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</h3>
                    {index === 0 ? (
                        <>
                            <div className="flex justify-between w-full">
                                <span className="text-gray-700 font-semibold">Max</span>
                                <span className="text-gray-700 ">{day.day.maxtemp_c}°C</span>
                            </div>
                            <div className="flex justify-between w-full">
                                <span className="text-gray-700 font-semibold">Min</span>
                                <span className="text-gray-700">{day.day.mintemp_c}°C</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-700">{day.day.maxtemp_c}°C</p>
                            <p className="text-gray-700">{day.day.mintemp_c}°C</p>
                        </>
                    )}
                    {/* <p className="text-gray-700">{day.day.condition.text}</p> */}
                </div>
            ))} 
        </div>
    );
}

export default Weather;