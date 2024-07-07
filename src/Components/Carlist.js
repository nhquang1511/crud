import React, { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCar from './AddCar.js';
import { CSVLink } from 'react-csv';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';


class Carlist extends Component {
    constructor(props) {
        super(props);
        this.state = { cars: [] };
    }

    componentDidMount() {
        this.fetchCars();
    }

    // Delete car 
    onDelClick = (link) => {
        fetch(link, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    toast.success("Car deleted", { position: "bottom-left" });
                    // Filter out the deleted car from the state
                    const updatedCars = this.state.cars.filter(car => car._links.self.href !== link);
                    this.setState({ cars: updatedCars });
                } else {
                    toast.error("Failed to delete car", { position: "bottom-left" });
                }
            })
            .catch(err => {
                toast.error("Error when deleting", { position: "bottom-left" });
                console.error(err);
            });
    }

    // Add new car
    addCar = (car) => {
        fetch('http://localhost:8080/api/cars',
            {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                }, body: JSON.stringify(car)
            }).then(res => this.fetchCars())
            .catch(err => console.error(err))
    }

    // Update car 
    updateCar(car, link) {
        fetch(link, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(car),
        })
            .then(res => {
                if (res.ok) {
                    toast.success("Changes saved", { position: "bottom-left" });
                    // Fetch updated car list after successful update
                    this.fetchCars();
                } else {
                    toast.error("Failed to save changes", { position: "bottom-left" });
                }
            })
            .catch(err => {
                toast.error("Error when saving", { position: "bottom-left" });
                console.error(err);
            });
    }

    fetchCars = () => {
        fetch('http://localhost:8080/api/cars').then((response) => response.json())
            .then((responseData) => {
                this.setState({
                    cars: responseData._embedded.cars || [], // Make sure cars is always an array
                });
            })
            .catch(err => console.error(err));
    }

    renderEditable = (cellInfo) => {
        const { cars } = this.state;

        if (cars.length === 0) {
            return null; // Handle case when cars array is empty
        }

        return (
            <div
                style={{ backgroundColor: "#fafafa" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const data = [...this.state.cars];
                    data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                    this.setState({ cars: data });
                }}
                dangerouslySetInnerHTML={{
                    __html: cars[cellInfo.index] ? cars[cellInfo.index][cellInfo.column.id] : ''
                }}
            />
        );
    }

    render() {
        // const { cars } = this.state;

        const columns = [{
            Header: 'Brand',
            accessor: 'brand',
            Cell: this.renderEditable
        }, {
            Header: 'Model',
            accessor: 'model',
            Cell: this.renderEditable
        }, {
            Header: 'Color',
            accessor: 'color',
            Cell: this.renderEditable
        }, {
            Header: 'Year', accessor: 'year',
            Cell: this.renderEditable
        }, {
            Header: 'Price €',
            accessor: 'price',
            Cell: this.renderEditable
        }, {
            id: 'savebutton',
            sortable: false,
            filterable: false,
            width: 100,
            accessor: '_links.self.href',
            Cell: ({ value, row }) => (
                <button
                    onClick={() => { this.updateCar(row, value) }}
                >
                    Save
                </button>
            )
        },
        {
            id: 'delbutton',
            sortable: false,
            filterable: false,
            width: 100,
            accessor: '_links.self.href',
            Cell: ({ value }) => (
                <button
                    onClick={() => { this.onDelClick(value) }}
                >
                    Delete
                </button>
            )
        }
        ]

        return (
            <div className="App"> <Grid container>
                <Grid item> <AddCar addCar={this.addCar} fetchCars={this.fetchCars} />
                </Grid> <Grid item >
                    <CSVLink data={this.state.cars} separator=";">Export CSV</CSVLink>
                </Grid> </Grid>
                <ReactTable data={this.state.cars} columns={columns} filterable={true} pageSize={10} />
                <ToastContainer autoClose={1500} /> 
                </div>
        );
    }
}

export default Carlist;
