import React, {useCallback, useState} from 'react';
import {Button, ButtonGroup, Form, InlineError, Link, Text, TextField, VerticalStack, Card, AlphaCard} from '@shopify/polaris';

import {useAuthenticatedFetch} from '../hooks';
import {useTranslation} from "react-i18next";

/**
 * Core component for the handling of the input processing of it.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const ValidationTextField = () => {
  const fetch = useAuthenticatedFetch();

  const [success, setSuccess] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [inputEmpty, setInputEmpty] = useState(false);
  const [internalError, setInternalError] = useState(false);
  const [inputScript, setInputScript] = useState('');
  const [deleteClicked,setDeleteClicked] = useState(false);

  const {t} = useTranslation();

  const handleChange = (newValue) => setInputScript(newValue);

  const updateState = (isEmpty, isSuccess, isError, isInternalError, isDeleteClicked) => {
    setInputEmpty(isEmpty);
    setSuccess(isSuccess);
    setInputError(isError);
    setInternalError(isInternalError);
    setDeleteClicked(isDeleteClicked);
  };

  /**
   * saves the script for backend use
   * @param inputScript
   * @returns {Promise<Response<any, Record<string, any>, number>>}
   */
  const setScript = async (inputScript) => {
    return await fetch('/api/script/set', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({inputScript}),
    });
  };

  /**
   * adds script to template
   *
   * @returns {Promise<Response<any, Record<string, any>, number>>}
   */
  const modifyTemplate = async () => {
   try {
     return await fetch('/api/template/modify', {
       method: 'GET',
       headers: {
         'Content-Type': 'application/json',
       },
     });
   }catch(error){
     updateState(false,false,false,true,false)
     console.error(error)
     return error;
   }

  };
  /**
   * starts the process of deleting the script
   * @returns {Promise<Response|*>}
   */
  const handleDelete = async () => {
    try{
      updateState(false,false,false,false,true)
      return await fetch('/api/template/delete', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }catch (error) {
      updateState(false,false,false,true,false)
      console.error(error);
      return error;
    }
  }

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    const pattern = '<script\\s+src="(https?://(?:[^/]+/public/(?:ccm19|app)\\.js\\?[^"]+|cloud\\.ccm19\\.de/app\\.js\\?[^"]+))"\\s+referrerpolicy="origin">\\s*</script>';
    const regexConst = new RegExp(pattern);

    if (inputScript.trim() === "") {
     await updateState(true, false, false, false,false);
      return;
    }

    if (!regexConst.test(inputScript)) {
      updateState(false, false, true, false,false);
      return;
    }

    try {

      await setScript(encodeURIComponent(inputScript));

    } catch (error) {

      updateState(false, false, false, true,false);
      console.error(error);

    }
    try {

      await modifyTemplate();
      updateState(false, true, false, false,false);

    } catch (error) {

      updateState(false, false, false, true,false);
      console.error(error);

    }
  }, [inputScript]);

  return (
    <Form onSubmit={handleSubmit}>
      <VerticalStack gap="05">
      <TextField
        label={t('form.field.label')}
        placeholder="<script src=http://site/public/app.js?apiKey=1337753522109847&amp;domain=1337  referrerpolicy=origin></script>"
        margin="normal"
        variant="outlined"
        value={inputScript}
        onChange={handleChange}
        required
        error={inputError}
        autoComplete="off"
      />
      <div className="button-container">
        <ButtonGroup>

          <Button secondary={true} destructive={true} onClick={handleDelete} >{t('form.field.delete')}</Button>

          <Button  primary={true} submit >{t('form.field.button')} </Button>

        </ButtonGroup>
      </div>
      </VerticalStack>

      {inputError || internalError || inputEmpty || success || deleteClicked ? (
          <div className="message-container" style={{ color: success || deleteClicked ? 'green' : 'orange' }}>
            {inputError && <InlineError message={t('form.field.errorMessage')} fieldID={inputScript} />}
            {internalError && <InlineError message={t('form.field.internalErrorMessage')} fieldID={inputScript} />}
            {inputEmpty && t('form.field.emptyInputMessage')}
            {success && t('form.field.successMessage')}
            {deleteClicked && t('form.field.deleteMessage')}
          </div>
      ) : null}

    </Form>
  );
};

/**
 *  Displays the components
 * @returns {JSX.Element}
 * @constructor
 */
export default function Homepage() {
  const {t} = useTranslation();
  const linkText = t('form.field.homepage');
  const linkUrl = t('form.field.link');

  const headerAction = {
    content: 'CCM19 Support',
    url: 'https://www.ccm19.de/en/support-request/',
  };

  return (
    <div className="HomePage">
      <Card.Header actions={[headerAction]} title="CCM19 Integration" />
      <AlphaCard>
        <VerticalStack gap="5">
          <Text variant="bodyMd" as="span">
            {linkText}
            <Link url={linkUrl}>{linkUrl}</Link>
          </Text>
          <ValidationTextField />
        </VerticalStack>
      </AlphaCard>
    </div>
  );
}
