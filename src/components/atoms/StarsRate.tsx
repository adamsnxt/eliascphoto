import type { Dispatch, SetStateAction } from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

interface StarsRateProps {
  rating: number;
  setRating?: Dispatch<SetStateAction<number>>;
}

export const StarsRate = ({ rating, setRating }: StarsRateProps) => (
  <div
    className="flex items-center gap-1"
    role={setRating ? "group" : undefined}
    aria-label={setRating ? "Seleccionar calificación" : undefined}
    aria-required={setRating ? true : undefined}
  >
    {Array.from({ length: 5 }).map((_, index) => {
      const position = index + 1;
      const star =
        rating >= position ? (
          <FaStar className="text-amber-400" />
        ) : rating >= position - 0.5 ? (
          <FaStarHalfAlt className="text-amber-400" />
        ) : (
          <FaStar className="text-white/20" />
        );

      return (
        <span
          key={index}
          className="relative inline-flex h-5 w-5 items-center justify-center"
        >
          <span aria-hidden="true">{star}</span>
          {setRating && (
            <>
              <button
                type="button"
                className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                aria-label={`${position - 0.5} de 5 estrellas`}
                aria-pressed={rating === position - 0.5}
                onClick={() => setRating(position - 0.5)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                aria-label={`${position} de 5 estrellas`}
                aria-pressed={rating === position}
                onClick={() => setRating(position)}
              />
            </>
          )}
        </span>
      );
    })}
  </div>
);
