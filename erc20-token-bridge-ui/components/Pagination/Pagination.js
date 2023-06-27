import Link from "next/link";

const Pagination = ({ routeName, page, pagesCount }) => {
  const pageNumber = page === undefined ? 1 : Number(page);
  const currentRoute = `/${routeName}/?page=${pageNumber}`;
  const nextRoute = `/${routeName}/?page=${pageNumber + 1}`;
  const previousRoute = `/${routeName}/?page=${pageNumber - 1}`;

  return (
    <div className="flex items-center">
      {pageNumber > 1 ? (
        <Link
          href={previousRoute}
          className="ml-20 shadow bg-orange-500 hover:bg-orange-400 focus:shadow-outline focus:outline-none text-white font-bold rounded"
        >
          prev page
        </Link>
      ) : (
        <Link
          href={currentRoute}
          className="ml-20 shadow bg-orange-500 hover:bg-orange-400 focus:shadow-outline focus:outline-none text-white font-bold rounded"
        >
          prev page
        </Link>
      )}

      {pageNumber < pagesCount ? (
        <Link
          href={nextRoute}
          className="ml-auto mr-20 shadow bg-orange-500 hover:bg-orange-400 focus:shadow-outline focus:outline-none text-white font-bold rounded"
        >
          next page
        </Link>
      ) : (
        <Link
          href={currentRoute}
          className="ml-auto mr-20 shadow bg-orange-500 hover:bg-orange-400 focus:shadow-outline focus:outline-none text-white font-bold rounded"
        >
          next page
        </Link>
      )}
    </div>
  );
};

export default Pagination;
