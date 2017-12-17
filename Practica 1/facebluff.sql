-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-12-2017 a las 14:17:01
-- Versión del servidor: 10.1.28-MariaDB
-- Versión de PHP: 7.1.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `facebluff`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `answers`
--

CREATE TABLE `answers` (
  `email` varchar(20) NOT NULL,
  `question_id` int(20) NOT NULL,
  `answer` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `answers`
--

INSERT INTO `answers` (`email`, `question_id`, `answer`) VALUES
('abc@gmail.com', 1, 'fbhajkvjf'),
('abc@gmail.com', 2, 'buah tio hasta la polla la verdad'),
('abc@gmail.com', 3, 'Mira tio vale ya joder'),
('adios@gmail.com', 1, 'Fuck me'),
('adios@gmail.com', 2, 'gauybsdg'),
('adios@gmail.com', 3, 'loco'),
('holi@gmail.com', 1, 'fhagvkwjç');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `friends`
--

CREATE TABLE `friends` (
  `email1` varchar(20) NOT NULL,
  `email2` varchar(20) NOT NULL,
  `accepted` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `friends`
--

INSERT INTO `friends` (`email1`, `email2`, `accepted`) VALUES
('abc@gmail.com', 'adios@gmail.com', 1),
('abc@gmail.com', 'dfhdshr', 1),
('adios@gmail.com', 'abc@gmail.com', 1),
('dfhdshr', 'abc@gmail.com', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `pregunta` varchar(20) NOT NULL,
  `respuestas` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `questions`
--

INSERT INTO `questions` (`id`, `pregunta`, `respuestas`) VALUES
(1, 'gfdsregaeg', 'fhagvkwjç,fbhajkvjf,gfdsahbg'),
(2, 'hdfthsth', 'garigbla,gauybsdg,fsauygsf,gfudislhg'),
(3, 'Hola', 'Que tal,loco,como vas,jaja,Mira tio vale ya joder');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('WP2hSMMX9-cC65Mraat96wEQpzP7ssBv', 1513550498, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":\"adios@gmail.com\",\"name\":\"Jose\",\"password\":\"aaaaa\",\"gender\":\"Masculino\",\"image\":\"Bat-01.png\",\"birthDate\":null}'),
('qT4kA4fhi1YBQOoAUgqfSlsChZbgpM2B', 1513602993, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":\"abc@gmail.com\",\"name\":\"BIG SHAQ\",\"password\":\"aaaaa\",\"gender\":\"Masculino\",\"image\":\"Frankenstein-01.png\",\"birthDate\":\"2014-02-03T23:00:00.000Z\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `email` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `image` varchar(30) DEFAULT NULL,
  `birthDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`email`, `password`, `name`, `gender`, `image`, `birthDate`) VALUES
('abc@gmail.com', 'aaaaa', 'BIG SHAQ', 'Masculino', 'Frankenstein-01.png', '2014-02-04'),
('adios@gmail.com', 'aaaaa', 'Jose', 'Masculino', 'Bat-01.png', NULL),
('dfhdshr', 'bbb', 'ASHNEEF', 'Masculino', 'Harley-01.png', NULL),
('holi@gmail.com', 'aaabbbccc', 'Jose Antonio', 'Masculino', 'Diablo-01.png', '2017-12-06'),
('kkk@gmail.com', 'kkk', 'KKKKK', 'Masculino', 'DLy97FQW0AAQIci.jpg', NULL),
('lmao@gmail.com', 'lmao', 'PAUL', 'Femenino', 'npp', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`email`,`question_id`),
  ADD KEY `FK_ANSWERS_2` (`question_id`);

--
-- Indices de la tabla `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`email1`,`email2`),
  ADD KEY `FK_FRIENDS_2` (`email2`);

--
-- Indices de la tabla `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `FK_ANSWERS_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`),
  ADD CONSTRAINT `FK_ANSWERS_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);

--
-- Filtros para la tabla `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `FK_FRIENDS_1` FOREIGN KEY (`email1`) REFERENCES `users` (`email`),
  ADD CONSTRAINT `FK_FRIENDS_2` FOREIGN KEY (`email2`) REFERENCES `users` (`email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
