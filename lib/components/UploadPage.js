import DropZone from './DropZone'
import ProgressBar from './ProgressBar'
import React from 'react'
import Spinner from './Spinner'
import Tempalink from './Tempalink'
import UploadActions from '../actions/UploadActions'
import UploadStore from '../stores/UploadStore'
import socket from 'filepizza-socket'

export default class UploadPage extends React.Component {

  constructor() {
    super()
    this.state = UploadStore.getState()

    this._onChange = () => {
      this.setState(UploadStore.getState())
    }

    this._onDownload = (peerID) => {
      UploadActions.sendToDownloader(peerID)
    }
  }

  componentDidMount() {
    UploadStore.listen(this._onChange)
    socket.on('download', this._onDownload)
  }

  componentDidUnmount() {
    UploadStore.unlisten(this._onChange)
    socket.removeListener('download', this._onDownload)
  }

  uploadFile(file) {
    UploadActions.uploadFile(file)
  }

  handleSelectedFile(event) {
    let files = event.target.files;
    if (files.length > 0) {
      UploadActions.uploadFile(files[0]);
    }
  }

  render() {
    switch (this.state.status) {
      case 'ready':

        return <DropZone onDrop={this.uploadFile.bind(this)}>
          <div className="page">

            <Spinner dir="up" />

            <h1>FilePizza</h1>
            <p>Free peer-to-peer file transfers in your browser.</p>
            <p>We never store anything. Files only served fresh.</p>
            <p>
              <label className="select-file-label">
                <input type="file" onChange={this.handleSelectedFile} required/>
                <span>select a file</span>
              </label>
            </p>
          </div>
        </DropZone>

      case 'processing':
        return <div className="page">

          <Spinner dir="up" animated />

          <h1>FilePizza</h1>
          <p>Processing...</p>

        </div>

      case 'uploading':
        var keys = Object.keys(this.state.peerProgress)
        keys.reverse()
        return <div className="page">

          <h1>FilePizza</h1>
          <Spinner dir="up" animated {...this.state.file} />

          <p>Send someone this link to download.</p>
          <p>This link will work as long as this page is open.</p>
          <Tempalink token={this.state.token} />

          {keys.length > 0 ? <p>Download Progress</p> : null}
          <div className="data">
            {keys.map((key) => {
              return <ProgressBar small key={key} value={this.state.peerProgress[key]} />
            })}
          </div>

        </div>
    }
  }

}
