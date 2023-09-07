import React, { useState, useCallback, useEffect } from 'react';
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa';
import { Container, Form, SubmitButton, List, DeleteButton, ErrorMessage } from './styles';
import { Link } from 'react-router-dom';

import api from '../../services/api';

const Main = () => {
  const [newRepo, setNewRepo]           = useState('');
  const [repositorios, setRepositorios] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [alert, setAlert]               = useState(null);
  const [errorMsg, setErrorMsg]         = useState(false);

  useEffect(() => {
    const repoStorage = localStorage.getItem('repos');
    
    if (repoStorage) {
      setRepositorios(JSON.parse(repoStorage));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('repos', JSON.stringify(repositorios));
  }, [repositorios]);

  function handleInputChange(e) {
    setNewRepo(e.target.value);
    setErrorMsg(false);
    setAlert(null);
  }

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    async function submit() {
      setLoading(true);
      setAlert(null);

      try {
        if (newRepo === '') {
          throw new Error('You need to specify a repository');
        }

        const hasRepo  = repositorios.find(repo => repo.name == newRepo);
        if (hasRepo) {
          throw new Error('Duplicated repository');
        }

        const response = await api.get(`repos/${newRepo}`);
        const data     = { name: response.data.full_name }

        setRepositorios([...repositorios, data]);
        setNewRepo('');
      }catch(err) {
        setAlert(true);
        setErrorMsg(err.message);
      }finally {
        setLoading(false);
      }
    }

    submit();

  }, [newRepo, repositorios]);

  const handleDelete = useCallback((repo) => {
    const find = repositorios.filter(r => r.name != repo)
    setRepositorios(find);
  }, [repositorios]);

  return(
    <>
     <Container>

        <h1>
          <FaGithub size={25}/>
          Meus Repositórios
        </h1>

        { errorMsg? <ErrorMessage>{ errorMsg }</ErrorMessage> : false }

        <Form onSubmit={ handleSubmit } error={alert}>
          <input 
            type="text" 
            placeholder="Adicionar repositórios" 
            value={newRepo}
            onChange={handleInputChange}
          />
          
          <SubmitButton loading={ loading ? 1 : 0 }>
            {loading? (
              <FaSpinner color="#FFF" size={14} />
            ) : 
              <FaPlus color="#FFF" size={14} />
            }
          </SubmitButton>
        </Form>

        <List>
          {repositorios.map(repo => (
            <li key={repo.name}>
              
              <span>
                <DeleteButton onClick={ () => { handleDelete(repo.name) }}>
                  <FaTrash size={14} />
                </DeleteButton>

                {repo.name}
              </span>

              <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
                <FaBars size={20} />
              </Link>
            </li>
          ))}
        </List>
     </Container>
    </>
  )
}

export default Main;