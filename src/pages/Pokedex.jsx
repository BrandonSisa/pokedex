import Header from "../components/pokedex/Header";
import { useSelector } from "react-redux";
import axios from "axios";
import PokemonCart from "../components/pokedex/PokemonCart";
import { useEffect, useState } from "react";
import "./pokedex.css"

const Pokedex = () => {
  // ***************  estados de la pokedex  ***************** //
  //traemos los poke a la base de datos
  const [pokemons, setpokemons] = useState([]);

  // traemos los tipos de pkms//
  const [types, settypes] = useState([]);

  // tipos de pokemon segun set 
  const [currenType, setCurrenType] = useState("");

  // renderizado de la lista de los pokemones
  const [currentPage, setCurrentPage] = useState(1);

  // renderizar con el form un pokemon con su nombre /
  const [pokemonName, setPokemonName] = useState("");

  // selector para traer los pokemons a la db
  const nameTrainer = useSelector((store) => store.nameTrainer);

  // *************** Aqui la logica de la pokedex ***************** //

  // *** Este es el submit para mostrar los pokemones con el nombre *** //
  const handleSubmit = (e) => {
    e.preventDefault();
    setPokemonName(e.target.pokemonName.value);
  };

  // Esta es la logica para el search de los pokemones //
  const pokemonsByName = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(pokemonName.toLowerCase())
  );

  // reender de todos los poke
  useEffect(() => {
    if (!currenType) {
      const URL = "https://pokeapi.co/api/v2/pokemon?limit=1281";
      console.log(URL);

      axios
        .get(URL)
        .then((res) => setpokemons(res.data.results))
        .catch((err) => console.log(err));
    }
  }, [currenType]);

  // !! Este es el useEffect paa el renderizado de la busqueda del select por especie !! //
  useEffect(() => {
    const URL = "https://pokeapi.co/api/v2/type";

    axios
      .get(URL)
      .then((res) => {
        const newTypes = res.data.results.map((type) => type.name);
        settypes(newTypes);
      })
      .catch((err) => console.log(err));
  }, []);

  // efectos de cada select de tipo de poke
  useEffect(() => {
    if (currenType) {
      const URL = `https://pokeapi.co/api/v2/type/${currenType}`;

      axios
        .get(URL)
        .then((res) => {
          const pokemonByType = res.data.pokemon.map(
            (pokemon) => pokemon.pokemon
          );
          setpokemons(pokemonByType);
        })
        .catch((err) => console.log(err));
    }
  }, [currenType]);
//logica 
  const paginationLogic = () => {
    //cantidade de pokes por pag
    const POKEMONS_PER_PAGE = 12;

    // ** Pokemones de mierda que se van a cortar ** //
    const sliceStart = (currentPage - 1) * POKEMONS_PER_PAGE;
    const sliceEnd = sliceStart + POKEMONS_PER_PAGE;
    const pokemonInPage = pokemonsByName.slice(sliceStart, sliceEnd);
//ultima pag
    const lastPage = Math.ceil(pokemonsByName.length / POKEMONS_PER_PAGE) || 1;

    // Bloque actual
    const PAGES_PER_BLOCK = 5;
    const actualBlock = Math.ceil(currentPage / PAGES_PER_BLOCK);

    // Bloque siguiente
    const nextBlock = actualBlock + 1;

    // Paginas que van aparecer en el bloque actual
    const pagesInBlock = [];
    const minPage = (actualBlock - 1) * PAGES_PER_BLOCK + 1;
    const maxPage = actualBlock * PAGES_PER_BLOCK;

    for (let i = minPage; i <= maxPage; i++) {
      if (i <= lastPage) {
        pagesInBlock.push(i);
      }
    }
    return { pagesInBlock, lastPage, pokemonInPage };
  };

  const { pagesInBlock, lastPage, pokemonInPage } = paginationLogic();
//useEffect para l cantidad de las paginas 
  useEffect(() => {
    setCurrentPage(1);
  }, [pokemonName, currenType]);

  // Botones para el las paginas end y start
  const handleClickPreviusPage = () => {
    const newCurrentPage = currentPage - 1;
    if (newCurrentPage >= 1) {
      setCurrentPage(newCurrentPage);
    }
  };

  const handleClickNextPage = () => {
    const newCurrentPage = currentPage + 1;
    if (newCurrentPage <= lastPage) {
      setCurrentPage(newCurrentPage);
    }
  };

  return (
    <section className="min-h-screen">
      <Header />
      {/* Section de filttos y saludos */}
      <section className="flex flex-col items-center justify-center">
        <h3 className="text-black font-semibold text-xl m-5 text-center ">
          Welcome{" "}
          <span className="text-xl font-bold text-orange-600 border-b-2 border-black ">
            {nameTrainer}
          </span>
          , here you can find your pokemon{" "}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="relative">
            <input
              id="pokemonName"
              placeholder="Search your pokemon"
              type="text"
              className="border-2 shadow-md shadow-black p-5 rounded-md w-[23rem] placeholder:text-lg placeholder:font-bold "
            />
            <button className="absolute top-[9px] right-4 shadow-lg shadow-red-600  bg-red-500 text-white p-2 pl-4 pr-4 rounded-md ">
              <i className="bx bx-search-alt text-xl font-bold "></i>
            </button>
          </div>

          {/* Section para el select que funciona para buscar el tipo */}
          <div>
            <select
              className="p-2 font-bold text-black bg-black/20 rounded-md"
              onChange={(e) => setCurrenType(e.target.value)}
            >
              <option value="">All</option>
              {types.map((type) => (
                <option
                  className="text-black capitalize"
                  value={type}
                  key={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>
        </form>
      </section>

      {/* Section de la lista de los pokemones */}
      <section className="grid grid-cols-2 content-center mx-auto p-4 gap-4 mt-10 sm:max-w-[1000px] sm:grid sm:grid-cols-2 sm:justify-items-center lg:grid-cols-3 sm:gap-6 sm:mx-auto sm:content-center sm:mt-10">
        {pokemonInPage.map((pokemon) => (
          <PokemonCart key={pokemon.url} pokemonUrl={pokemon.url} />
        ))}
      </section>
      {/* Section de paginacion CON UNA LISTA */}
      <ul className=" grid grid-cols-4 text-center content-center gap-4 p-4 sm:flex sm:justify-center ">
        {/*losta de desplazamiento entre pag
        <li
          onClick={() => setCurrentPage(1)}
          className="pages_all"
        >
          {"<<"}
        </li>
        {/* Lista para la pagina de adelante */}
        <li
          onClick={handleClickPreviusPage}
          className="pages_all"
        >
          {"<"}
        </li>
        {pagesInBlock.map((numberPage) => (
          // ** Este boton es para el cambio de paginas ** //
          <li
            className={`numbers_pages ${
              numberPage === currentPage && "your-page"
            } `}
            onClick={() => setCurrentPage(numberPage)}
            key={numberPage}
          >
            {numberPage}
          </li>
        ))}
        {/* // ?? despazo de pagina hacia adelante  // */}
        <li
          onClick={handleClickNextPage}
          className="pages_all"
        >
          {">"}
        </li>
        {/* // !! ir a la ultima pagina // */}
        <li
          onClick={() => setCurrentPage(lastPage)}
          className="pages_all"
        >
          {">>"}
        </li>
      </ul>
    </section>
  );
};

export default Pokedex;
